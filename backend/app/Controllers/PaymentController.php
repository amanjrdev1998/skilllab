<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\PaymentRepository;
use App\Services\PayPalClient;
use RuntimeException;

final class PaymentController
{
    private PaymentRepository $payments;
    private PayPalClient $paypal;
    private string $currency;

    public function __construct(
        ?PaymentRepository $payments = null,
        ?PayPalClient $paypal = null
    ) {
        global $config;
        $this->payments = $payments ?? new PaymentRepository();
        $this->paypal = $paypal ?? new PayPalClient();
        $this->currency = $config['paypal']['currency'];
    }

    public function createOrder(Request $request, array $user, Response $response): never
    {
        $courseId = $request->input('course_id');
        $validatedCourseId = is_int($courseId) || is_string($courseId)
            ? filter_var($courseId, FILTER_VALIDATE_INT)
            : false;

        if ($validatedCourseId === false || $validatedCourseId < 1) {
            $response->error('A valid course id is required.', 422);
        }

        $uniqueKey = $this->uuid();
        $payment = $this->payments->createPending(
            (int) $user['id'],
            $validatedCourseId,
            $uniqueKey,
            $this->currency
        );
        if ($payment === null) {
            $response->error('Published paid course not found.', 404);
        }

        try {
            $order = $this->paypal->createOrder($payment);
            $orderId = $order['id'] ?? null;
            if (!is_string($orderId) || $orderId === '') {
                throw new RuntimeException('PayPal did not return an order id.');
            }
            $this->payments->setPayPalOrderId($uniqueKey, $orderId);
        } catch (\Throwable $exception) {
            $this->payments->markFailed($uniqueKey);
            error_log('PayPal order creation failed: ' . $exception->getMessage());
            $response->error('Unable to create a PayPal order.', 502);
        }

        $response->success([
            'unique_key' => $uniqueKey,
            'order_id' => $orderId,
            'amount' => $payment['amount'],
            'currency' => $payment['currency'],
        ], 201);
    }

    public function captureOrder(Request $request, array $user, Response $response): never
    {
        $uniqueKey = $request->input('unique_key');
        if (!is_string($uniqueKey) || !preg_match(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $uniqueKey
        )) {
            $response->error('A valid payment unique_key is required.', 422);
        }

        $payment = $this->payments->findForUser($uniqueKey, (int) $user['id']);
        if ($payment === null) {
            $response->error('Payment not found.', 404);
        }
        if ($payment['status'] === 'completed') {
            $response->success(['status' => 'completed']);
        }
        if ($payment['status'] !== 'pending' || $payment['paypal_order_id'] === null) {
            $response->error('Payment is not pending.', 409);
        }

        try {
            $order = $this->paypal->captureOrder($payment['paypal_order_id'], $uniqueKey);
            $capture = $order['purchase_units'][0]['payments']['captures'][0] ?? null;
            $captureId = is_array($capture) ? ($capture['id'] ?? null) : null;
            $captureAmount = is_array($capture) ? ($capture['amount'] ?? null) : null;
            $purchaseUnit = $order['purchase_units'][0] ?? [];

            if (
                ($order['id'] ?? null) !== $payment['paypal_order_id']
                || ($order['status'] ?? null) !== 'COMPLETED'
                || ($purchaseUnit['custom_id'] ?? null) !== $uniqueKey
                || !is_string($captureId)
                || ($capture['status'] ?? null) !== 'COMPLETED'
                || !is_array($captureAmount)
                || ($captureAmount['currency_code'] ?? null) !== $payment['currency']
                || number_format((float) ($captureAmount['value'] ?? -1), 2, '.', '')
                    !== number_format((float) $payment['amount'], 2, '.', '')
            ) {
                throw new RuntimeException('PayPal capture details did not match the payment.');
            }

            $this->payments->completeAndEnroll($uniqueKey, $captureId);
        } catch (\Throwable $exception) {
            error_log('PayPal capture failed: ' . $exception->getMessage());
            $response->error('Unable to verify or complete the PayPal payment.', 502);
        }

        $response->success(['status' => 'completed']);
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
