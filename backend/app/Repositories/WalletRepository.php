<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;
use RuntimeException;

final class WalletRepository
{
    private PDO $database;

    public function __construct(?PDO $database = null)
    {
        $this->database = $database ?? Database::connection();
    }

    private function database(): PDO
    {
        return $this->database;
    }

    public function getBalance(int $userId): float
    {
        $statement = $this->database()->prepare(
            'SELECT wallet FROM users WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $userId]);
        $row = $statement->fetch();
        return $row === false ? 0.0 : (float) $row['wallet'];
    }

    /**
     * Credit wallet + ledger entry. Returns new balance.
     */
    public function credit(int $userId, float $amount, string $reason, ?string $reference = null): float
    {
        if ($amount <= 0) {
            throw new RuntimeException('Credit amount must be positive.');
        }
        $database = $this->database();
        $database->beginTransaction();
        try {
            $statement = $database->prepare(
                'UPDATE users SET wallet = CAST(wallet AS DECIMAL(10,2)) + :amount WHERE id = :id'
            );
            $statement->execute(['amount' => $amount, 'id' => $userId]);

            $statement = $database->prepare(
                "INSERT INTO wallet_transactions (user_id, type, amount, reason, reference)
                 VALUES (:user_id, 'credit', :amount, :reason, :reference)"
            );
            $statement->execute([
                'user_id' => $userId,
                'amount' => $amount,
                'reason' => $reason,
                'reference' => $reference,
            ]);
            $database->commit();
        } catch (\Throwable $exception) {
            if ($database->inTransaction()) {
                $database->rollBack();
            }
            throw $exception;
        }
        return $this->getBalance($userId);
    }

    /**
     * Debit wallet + ledger entry. Returns new balance.
     * Throws when the balance is insufficient.
     */
    public function debit(int $userId, float $amount, string $reason, ?string $reference = null): float
    {
        if ($amount <= 0) {
            throw new RuntimeException('Debit amount must be positive.');
        }
        $database = $this->database();
        $database->beginTransaction();
        try {
            $statement = $database->prepare(
                'SELECT wallet FROM users WHERE id = :id FOR UPDATE'
            );
            $statement->execute(['id' => $userId]);
            $row = $statement->fetch();
            $balance = $row === false ? 0.0 : (float) $row['wallet'];
            if ($balance < $amount) {
                throw new RuntimeException('Insufficient wallet balance.');
            }

            $statement = $database->prepare(
                'UPDATE users SET wallet = CAST(wallet AS DECIMAL(10,2)) - :amount WHERE id = :id'
            );
            $statement->execute(['amount' => $amount, 'id' => $userId]);

            $statement = $database->prepare(
                "INSERT INTO wallet_transactions (user_id, type, amount, reason, reference)
                 VALUES (:user_id, 'debit', :amount, :reason, :reference)"
            );
            $statement->execute([
                'user_id' => $userId,
                'amount' => $amount,
                'reason' => $reason,
                'reference' => $reference,
            ]);
            $database->commit();
        } catch (\Throwable $exception) {
            if ($database->inTransaction()) {
                $database->rollBack();
            }
            throw $exception;
        }
        return $this->getBalance($userId);
    }

    public function transactionsForUser(int $userId, int $limit = 50): array
    {
        $statement = $this->database()->prepare(
            'SELECT id, type, amount, reason, reference, created_at
             FROM wallet_transactions
             WHERE user_id = :user_id
             ORDER BY created_at DESC
             LIMIT ' . max(1, min(200, $limit))
        );
        $statement->execute(['user_id' => $userId]);
        return $statement->fetchAll();
    }

    public function createWithdrawalRequest(int $userId, float $amount, string $upiId): array
    {
        $statement = $this->database()->prepare(
            'INSERT INTO withdrawal_requests (user_id, amount, upi_id, status)
             VALUES (:user_id, :amount, :upi_id, :status)'
        );
        $statement->execute([
            'user_id' => $userId,
            'amount' => $amount,
            'upi_id' => $upiId,
            'status' => 'pending',
        ]);
        $id = (int) $this->database()->lastInsertId();
        return $this->findWithdrawal($id) ?? [];
    }

    public function findWithdrawal(int $id): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT id, user_id, amount, upi_id, status, admin_note, created_at, updated_at
             FROM withdrawal_requests WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $row = $statement->fetch();
        return $row === false ? null : $row;
    }

    public function withdrawalsForUser(int $userId): array
    {
        $statement = $this->database()->prepare(
            'SELECT id, amount, upi_id, status, admin_note, created_at, updated_at
             FROM withdrawal_requests
             WHERE user_id = :user_id
             ORDER BY created_at DESC'
        );
        $statement->execute(['user_id' => $userId]);
        return $statement->fetchAll();
    }

    public function allWithdrawalsForAdmin(): array
    {
        $statement = $this->database()->prepare(
            'SELECT w.id, w.user_id, u.name AS user_name, u.email AS user_email,
                    w.amount, w.upi_id, w.status, w.admin_note, w.created_at, w.updated_at
             FROM withdrawal_requests w
             INNER JOIN users u ON u.id = w.user_id
             ORDER BY w.created_at DESC'
        );
        $statement->execute();
        return $statement->fetchAll();
    }

    /**
     * Move a withdrawal between statuses. Returns the updated row.
     * Rejecting refunds the amount back to the user's wallet.
     */
    public function setWithdrawalStatus(int $id, string $status, ?string $adminNote = null): ?array
    {
        if (!in_array($status, ['approved', 'rejected', 'paid'], true)) {
            throw new RuntimeException('Invalid withdrawal status.');
        }
        $database = $this->database();
        $database->beginTransaction();
        try {
            $statement = $database->prepare(
                'SELECT id, user_id, amount, status FROM withdrawal_requests WHERE id = :id FOR UPDATE'
            );
            $statement->execute(['id' => $id]);
            $row = $statement->fetch();
            if ($row === false) {
                throw new RuntimeException('Withdrawal request not found.');
            }
            $from = $row['status'];
            $allowed = [
                'pending' => ['approved', 'rejected'],
                'approved' => ['paid', 'rejected'],
            ];
            if (!isset($allowed[$from]) || !in_array($status, $allowed[$from], true)) {
                throw new RuntimeException("Cannot move withdrawal from {$from} to {$status}.");
            }

            // Rejection refunds the held amount.
            if ($status === 'rejected') {
                $database->prepare(
                    'UPDATE users SET wallet = CAST(wallet AS DECIMAL(10,2)) + :amount WHERE id = :id'
                )->execute(['amount' => (float) $row['amount'], 'id' => (int) $row['user_id']]);
                $database->prepare(
                    "INSERT INTO wallet_transactions (user_id, type, amount, reason, reference)
                     VALUES (:user_id, 'credit', :amount, 'Withdrawal request rejected — refund', :reference)"
                )->execute([
                    'user_id' => (int) $row['user_id'],
                    'amount' => (float) $row['amount'],
                    'reference' => 'withdrawal-' . $id,
                ]);
            }

            $database->prepare(
                'UPDATE withdrawal_requests SET status = :status, admin_note = :note WHERE id = :id'
            )->execute(['status' => $status, 'note' => $adminNote, 'id' => $id]);

            $database->commit();
        } catch (\Throwable $exception) {
            if ($database->inTransaction()) {
                $database->rollBack();
            }
            throw $exception;
        }
        return $this->findWithdrawal($id);
    }
}
