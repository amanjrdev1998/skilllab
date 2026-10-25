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
        string $currency
    ): ?array {
        $database = $this->database();
        $statement = $database->prepare(
            "INSERT INTO payment_transactions (unique_key, user_id, course_id, amount, currency)
             SELECT :unique_key, :user_id, id, price, :currency
             FROM courses
             WHERE id = :course_id AND status = 'published' AND price > 0"
        );
        $statement->execute([
            'unique_key' => $uniqueKey,
            'user_id' => $userId,
            'currency' => $currency,
            'course_id' => $courseId,
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
    }
}
