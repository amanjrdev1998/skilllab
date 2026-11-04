<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;
use RuntimeException;

final class PaymentRepository
{
    private ?PDO $database = null;

    private function database(): PDO
    {
        return $this->database ??= Database::connection();
    }

    public function createPending(
        int $userId,
        int $courseId,
        string $uniqueKey,
        string $currency,
        ?string $referralCode = null
    ): ?array {
        $database = $this->database();
        $statement = $database->prepare(
            "INSERT INTO payment_transactions (unique_key, user_id, course_id, amount, currency, referral_code)
             SELECT :unique_key, :user_id, id, price, :currency, :referral_code
             FROM courses
             WHERE id = :course_id AND status = 'published' AND price > 0"
        );
        $statement->execute([
            'unique_key' => $uniqueKey,
            'user_id' => $userId,
            'currency' => $currency,
            'course_id' => $courseId,
            'referral_code' => $referralCode,
        ]);

        if ($statement->rowCount() !== 1) {
            return null;
        }

        $statement = $database->prepare(
            'SELECT payment_transactions.unique_key, payment_transactions.amount,
                    payment_transactions.currency, courses.title
             FROM payment_transactions
             INNER JOIN courses ON courses.id = payment_transactions.course_id
             WHERE payment_transactions.unique_key = :unique_key'
        );
        $statement->execute(['unique_key' => $uniqueKey]);

        return $statement->fetch() ?: null;
    }

    public function setPayPalOrderId(string $uniqueKey, string $orderId): void
    {
        $statement = $this->database()->prepare(
            "UPDATE payment_transactions
             SET paypal_order_id = :order_id
             WHERE unique_key = :unique_key AND status = 'pending'"
        );
        $statement->execute([
            'order_id' => $orderId,
            'unique_key' => $uniqueKey,
        ]);
        if ($statement->rowCount() !== 1) {
            throw new RuntimeException('Could not save the PayPal order.');
        }
    }

    public function markFailed(string $uniqueKey): void
    {
        $statement = $this->database()->prepare(
            "UPDATE payment_transactions
             SET status = 'failed'
             WHERE unique_key = :unique_key AND status = 'pending'"
        );
        $statement->execute(['unique_key' => $uniqueKey]);
    }

    public function findForUser(string $uniqueKey, int $userId): ?array
    {
        $statement = $this->database()->prepare(
            "SELECT unique_key, user_id, course_id, paypal_order_id, amount, currency, status
             FROM payment_transactions
             WHERE unique_key = :unique_key AND user_id = :user_id
             LIMIT 1"
        );
        $statement->execute([
            'unique_key' => $uniqueKey,
            'user_id' => $userId,
        ]);

        return $statement->fetch() ?: null;
    }

    public function completeAndEnroll(string $uniqueKey, string $captureId): void
    {
        $database = $this->database();
        $database->beginTransaction();

        try {
            $statement = $database->prepare(
                'SELECT id, user_id, course_id, paypal_order_id, amount, status
                 FROM payment_transactions
                 WHERE unique_key = :unique_key
                 FOR UPDATE'
            );
            $statement->execute(['unique_key' => $uniqueKey]);
            $payment = $statement->fetch();

            if ($payment === false) {
                throw new RuntimeException('Payment record was not found.');
            }

            if ($payment['status'] === 'completed') {
                $database->commit();
                return;
            }

            $this->completePayment($database, $payment, $captureId);

            $database->commit();
        } catch (\Throwable $exception) {
            if ($database->inTransaction()) {
                $database->rollBack();
            }

            throw $exception;
        }
    }

    public function completeFromPayPalWebhook(
        string $orderId,
        string $captureId,
        string $amount,
        string $currency
    ): void {
        $database = $this->database();
        $database->beginTransaction();

        try {
            $statement = $database->prepare(
                'SELECT id, user_id, course_id, paypal_order_id, paypal_capture_id,
                        amount, currency, status
                 FROM payment_transactions
                 WHERE paypal_order_id = :order_id
                 FOR UPDATE'
            );
            $statement->execute(['order_id' => $orderId]);
            $payment = $statement->fetch();

            if ($payment === false) {
                throw new RuntimeException('PayPal order was not found.');
            }
            if (
                $payment['currency'] !== $currency
                || number_format((float) $payment['amount'], 2, '.', '')
                    !== number_format((float) $amount, 2, '.', '')
            ) {
                throw new RuntimeException('PayPal capture amount does not match the payment.');
            }

            if ($payment['status'] === 'completed') {
                if ($payment['paypal_capture_id'] !== $captureId) {
                    throw new RuntimeException('PayPal capture does not match the completed payment.');
                }
                $database->commit();
                return;
            }
            if ($payment['status'] !== 'pending') {
                throw new RuntimeException('Payment is not pending.');
            }

            $this->completePayment($database, $payment, $captureId);
            $database->commit();
        } catch (\Throwable $exception) {
            if ($database->inTransaction()) {
                $database->rollBack();
            }

            throw $exception;
        }
    }

    /**
     * Details for the admin payment notification, keyed by the internal unique key.
     */
    public function paymentDetails(string $uniqueKey): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT p.amount, p.currency, p.paypal_order_id, p.paypal_capture_id,
                    p.referral_code, p.referral_amount,
                    c.title AS course_title, u.name AS user_name, u.email AS user_email
             FROM payment_transactions p
             INNER JOIN courses c ON c.id = p.course_id
             INNER JOIN users u ON u.id = p.user_id
             WHERE p.unique_key = :key LIMIT 1'
        );
        $statement->execute(['key' => $uniqueKey]);
        $row = $statement->fetch();
        return $row === false ? null : $this->formatDetails($row);
    }

    /**
     * Same, keyed by the PayPal order id (for the webhook path).
     */
    public function paymentDetailsByOrderId(string $orderId): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT p.amount, p.currency, p.paypal_order_id, p.paypal_capture_id,
                    p.referral_code, p.referral_amount,
                    c.title AS course_title, u.name AS user_name, u.email AS user_email
             FROM payment_transactions p
             INNER JOIN courses c ON c.id = p.course_id
             INNER JOIN users u ON u.id = p.user_id
             WHERE p.paypal_order_id = :order_id LIMIT 1'
        );
        $statement->execute(['order_id' => $orderId]);
        $row = $statement->fetch();
        return $row === false ? null : $this->formatDetails($row);
    }

    /** @param array<string,mixed> $row */
    private function formatDetails(array $row): array
    {
        return [
            'course_title' => (string) $row['course_title'],
            'amount' => number_format((float) $row['amount'], 2, '.', ''),
            'currency' => (string) $row['currency'],
            'user_name' => (string) $row['user_name'],
            'user_email' => (string) $row['user_email'],
            'capture_id' => (string) ($row['paypal_capture_id'] ?? ''),
            'order_id' => (string) ($row['paypal_order_id'] ?? ''),
            'referral_code' => $row['referral_code'] !== null ? (string) $row['referral_code'] : null,
            'referral_amount' => (float) ($row['referral_amount'] ?? 0),
        ];
    }

    private function completePayment(PDO $database, array $payment, string $captureId): void
    {
        if ($payment['status'] !== 'pending' || $payment['paypal_order_id'] === null) {
            throw new RuntimeException('Payment is not pending.');
        }

        $statement = $database->prepare(
            "UPDATE payment_transactions
             SET status = 'completed', paypal_capture_id = :capture_id
             WHERE id = :id"
        );
        $statement->execute([
            'capture_id' => $captureId,
            'id' => $payment['id'],
        ]);

        $statement = $database->prepare(
            "INSERT INTO enrollments
                (user_id, course_id, course_name, order_id, status, price_paid)
             SELECT payments.user_id, payments.course_id, courses.title,
                    payments.paypal_order_id, 'active', payments.amount
             FROM payment_transactions AS payments
             INNER JOIN courses ON courses.id = payments.course_id
             WHERE payments.id = :payment_id
             ON DUPLICATE KEY UPDATE
                course_name = VALUES(course_name),
                order_id = VALUES(order_id),
                status = 'active',
                price_paid = VALUES(price_paid)"
        );
        $statement->execute(['payment_id' => $payment['id']]);

        $this->creditReferrer($database, (int) $payment['id']);
    }

    /**
     * Credit the referral-code owner with the configured commission.
     * Runs inside the caller's transaction; silently skips when no valid
     * referral code was used for the purchase.
     */
    private function creditReferrer(PDO $database, int $paymentId): void
    {
        global $config;
        $percent = (float) ($config['referral']['commission_percent'] ?? 10);
        if ($percent <= 0) {
            return;
        }

        $statement = $database->prepare(
            'SELECT referral_code, amount, user_id
             FROM payment_transactions WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $paymentId]);
        $payment = $statement->fetch();
        if ($payment === false || empty($payment['referral_code'])) {
            return;
        }

        $statement = $database->prepare(
            'SELECT id FROM users WHERE referral_code = :code LIMIT 1'
        );
        $statement->execute(['code' => $payment['referral_code']]);
        $referrer = $statement->fetch();
        if ($referrer === false || (int) $referrer['id'] === (int) $payment['user_id']) {
            return;
        }

        $commission = round((float) $payment['amount'] * $percent / 100, 2);
        if ($commission <= 0) {
            return;
        }
        $referrerId = (int) $referrer['id'];

        $database->prepare(
            'UPDATE users SET wallet = CAST(wallet AS DECIMAL(10,2)) + :amount WHERE id = :id'
        )->execute(['amount' => $commission, 'id' => $referrerId]);

        $database->prepare(
            "INSERT INTO wallet_transactions (user_id, type, amount, reason, reference)
             VALUES (:user_id, 'credit', :amount, :reason, :reference)"
        )->execute([
            'user_id' => $referrerId,
            'amount' => $commission,
            'reason' => 'Referral commission (' . rtrim(rtrim(number_format($percent, 2, '.', ''), '0'), '.') . '%)',
            'reference' => 'payment-' . $paymentId,
        ]);

        $database->prepare(
            'UPDATE payment_transactions SET referral_amount = :amount WHERE id = :id'
        )->execute(['amount' => $commission, 'id' => $paymentId]);
    }
}
