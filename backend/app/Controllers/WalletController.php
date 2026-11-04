<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\UserRepository;
use App\Repositories\WalletRepository;
use RuntimeException;

final class WalletController
{
    private WalletRepository $wallets;
    private UserRepository $users;

    public function __construct(
        ?WalletRepository $wallets = null,
        ?UserRepository $users = null
    ) {
        $this->wallets = $wallets ?? new WalletRepository();
        $this->users = $users ?? new UserRepository();
    }

    private function minWithdrawal(): float
    {
        global $config;
        return max(0, (float) ($config['referral']['min_withdrawal'] ?? 100));
    }

    /**
     * GET /api/v1/wallet — balance, referral code, recent transactions.
     */
    public function show(array $user, Response $response): never
    {
        $userId = (int) $user['id'];
        $full = $this->users->findById($userId);
        $response->success([
            'balance' => $this->wallets->getBalance($userId),
            'referral_code' => $full['referral_code'] ?? null,
            'transactions' => $this->wallets->transactionsForUser($userId),
        ]);
    }

    /**
     * POST /api/v1/wallet/withdraw { amount, upi_id }
     * Debits the wallet immediately; a rejection refunds it.
     */
    public function requestWithdrawal(Request $request, array $user, Response $response): never
    {
        $userId = (int) $user['id'];
        $amount = (float) $request->input('amount', 0);
        $upiId = trim((string) $request->input('upi_id', ''));

        $min = $this->minWithdrawal();
        if ($amount < $min) {
            $response->error('Minimum withdrawal amount is ' . number_format($min, 2) . '.', 422);
        }
        if ($upiId === '' || strlen($upiId) > 120 || strpos($upiId, '@') === false) {
            $response->error('A valid UPI ID (e.g. name@upi) is required.', 422);
        }

        try {
            $this->wallets->debit($userId, $amount, 'Withdrawal request', null);
        } catch (RuntimeException $exception) {
            $response->error($exception->getMessage(), 422);
        }

        try {
            $withdrawal = $this->wallets->createWithdrawalRequest($userId, $amount, $upiId);
        } catch (\Throwable $exception) {
            // Roll the debit back: refund the wallet.
            try {
                $this->wallets->credit($userId, $amount, 'Withdrawal request failed — refund', null);
            } catch (\Throwable $ignored) {
            }
            error_log('Withdrawal request failed: ' . $exception->getMessage());
            $response->error('Could not create the withdrawal request.', 500);
        }

        $response->success([
            'withdrawal' => $withdrawal,
            'balance' => $this->wallets->getBalance($userId),
        ], 201);
    }

    /**
     * GET /api/v1/wallet/withdrawals — the user's own requests.
     */
    public function myWithdrawals(array $user, Response $response): never
    {
        $response->success([
            'withdrawals' => $this->wallets->withdrawalsForUser((int) $user['id']),
        ]);
    }

    /**
     * GET /api/v1/admin/withdrawals
     */
    public function listForAdmin(Response $response): never
    {
        $response->success([
            'withdrawals' => $this->wallets->allWithdrawalsForAdmin(),
        ]);
    }

    /**
     * POST /api/v1/admin/withdrawals/{id}/{action} — approve | reject | paid
     */
    public function setStatus(int $id, string $action, Request $request, Response $response): never
    {
        if (!in_array($action, ['approve', 'reject', 'paid'], true)) {
            $response->error('Unknown action.', 400);
        }
        $status = ['approve' => 'approved', 'reject' => 'rejected', 'paid' => 'paid'][$action];
        $note = trim((string) $request->input('admin_note', ''));
        try {
            $withdrawal = $this->wallets->setWithdrawalStatus(
                $id,
                $status,
                $note === '' ? null : $note
            );
        } catch (RuntimeException $exception) {
            $response->error($exception->getMessage(), 422);
        }
        if ($withdrawal === null) {
            $response->error('Withdrawal request not found.', 404);
        }
        $response->success(['withdrawal' => $withdrawal]);
    }
}
