<?php declare(strict_types=1);

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
        $this->currency = (string) ($config['paypal']['currency'] ?? 'USD');
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
        try {
            $payment = $this->payments->createPending(
                (int) $user['id'],
                $validatedCourseId,
                $uniqueKey,
                $this->currency
            );
        } catch (\Throwable $exception) {
            error_log(
                'PayPal order creation failed: '
                . $exception->getMessage()
            );

            try {
                $this->payments->markFailed($uniqueKey);
            } catch (\Throwable $databaseException) {
                error_log(
                    'Failed to update payment status: '
                    . $databaseException->getMessage()
                );
            }

            $response->error('Unable to create a PayPal order.', 502);
        }

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
            $customId = $purchaseUnit['custom_id']
                ?? ($capture['custom_id'] ?? null)
                ?? ($purchaseUnit['reference_id'] ?? null);

            if (
                ($order['id'] ?? null) !== $payment['paypal_order_id'] ||
                ($order['status'] ?? null) !== 'COMPLETED' ||
                $customId !== $uniqueKey ||
                !is_string($captureId) ||
                ($capture['status'] ?? null) !== 'COMPLETED' ||
                !is_array($captureAmount) ||
                ($captureAmount['currency_code'] ?? null) !== $payment['currency'] ||
                number_format((float) ($captureAmount['value'] ?? -1), 2, '.', '') !==
                    number_format((float) $payment['amount'], 2, '.', '')
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

    public function paypalWebhook(Request $request, Response $response): never
    {
        $event = $request->allInput();
        $eventId = $event['id'] ?? null;
        $eventType = $event['event_type'] ?? null;
        if (
            !is_string($eventId) ||
            $eventId === '' ||
            !is_string($eventType) ||
            $eventType === ''
        ) {
            $response->error('Invalid PayPal webhook event.', 400);
        }

        $headerNames = [
            'paypal-auth-algo',
            'paypal-cert-url',
            'paypal-transmission-id',
            'paypal-transmission-sig',
            'paypal-transmission-time',
        ];
        $headers = [];
        foreach ($headerNames as $headerName) {
            $headers[$headerName] = $request->header($headerName);
        }

        try {
            if (!$this->paypal->verifyWebhookSignature($headers, $event)) {
                $response->error('PayPal webhook signature verification failed.', 401);
            }
        } catch (\Throwable $exception) {
            error_log('PayPal webhook verification failed: ' . $exception->getMessage());
            $response->error('Unable to verify the PayPal webhook.', 502);
        }

        if ($eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
            $response->success(['received' => true]);
        }

        $capture = $event['resource'] ?? null;
        $relatedIds = is_array($capture)
            ? ($capture['supplementary_data']['related_ids'] ?? null)
            : null;
        $amount = is_array($capture) ? ($capture['amount'] ?? null) : null;
        if (
            !is_array($capture) ||
            ($capture['status'] ?? null) !== 'COMPLETED' ||
            !is_string($capture['id'] ?? null) ||
            $capture['id'] === '' ||
            !is_array($relatedIds) ||
            !is_string($relatedIds['order_id'] ?? null) ||
            $relatedIds['order_id'] === '' ||
            !is_array($amount) ||
            !is_string($amount['value'] ?? null) ||
            !preg_match('/^\d+(?:\.\d{1,2})?$/D', $amount['value']) ||
            !is_string($amount['currency_code'] ?? null) ||
            $amount['currency_code'] === ''
        ) {
            $response->error('Invalid PayPal capture event.', 400);
        }

        try {
            $this->payments->completeFromPayPalWebhook(
                $relatedIds['order_id'],
                $capture['id'],
                $amount['value'],
                $amount['currency_code']
            );
        } catch (\Throwable $exception) {
            error_log('PayPal webhook processing failed for event ' . $eventId . ': ' . $exception->getMessage());
            $response->error('Unable to process the PayPal capture webhook.', 500);
        }

        $response->success(['received' => true, 'status' => 'completed']);
    }

    private function uuid(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0xF) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3F) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
