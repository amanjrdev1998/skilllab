<?php

declare(strict_types=1);

namespace App\Services;

use RuntimeException;

final class PayPalClient
{
    private array $configuration;
    private ?string $cachedAccessToken = null;
    private int $accessTokenExpiresAt = 0;

    public function __construct(?array $configuration = null)
    {
        global $config;

        $this->configuration = $configuration ?? ($config['paypal'] ?? []);

        $environment = $this->configuration['environment'] ?? 'sandbox';

        if (!in_array($environment, ['sandbox', 'live'], true)) {
            throw new RuntimeException('Invalid PayPal environment.');
        }
    }

    private function baseUrl(): string
    {
        return ($this->configuration['environment'] ?? 'sandbox') === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    private function credentials(): array
    {
        $clientId = trim((string) ($this->configuration['client_id'] ?? ''));
        $clientSecret = trim((string) ($this->configuration['client_secret'] ?? ''));

        if ($clientId === '' || $clientSecret === '') {
            throw new RuntimeException(
                'PayPal client ID or client secret is not configured.'
            );
        }

        return [$clientId, $clientSecret];
    }

    public function createOrder(array $payment): array
    {
        foreach (['unique_key', 'amount', 'currency', 'title'] as $key) {
            if (!isset($payment[$key]) || !is_scalar($payment[$key])) {
                throw new RuntimeException(
                    'Missing or invalid payment field: ' . $key
                );
            }
        }

        $amount = (float) $payment['amount'];
        $currency = strtoupper((string) $payment['currency']);

        if (!is_finite($amount) || $amount <= 0) {
            throw new RuntimeException('Payment amount must be positive.');
        }

        if (!preg_match('/^[A-Z]{3}$/D', $currency)) {
            throw new RuntimeException('Invalid payment currency.');
        }

        return $this->request(
            'POST',
            '/v2/checkout/orders',
            [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => (string) $payment['unique_key'],
                    'custom_id' => (string) $payment['unique_key'],
                    'description' => mb_substr((string) $payment['title'], 0, 127, 'UTF-8'),
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => number_format($amount, 2, '.', ''),
                    ],
                ]],
                'application_context' => [
                    'shipping_preference' => 'NO_SHIPPING',
                    'user_action' => 'PAY_NOW',
                ],
            ],
            (string) $payment['unique_key']
        );
    }

    public function captureOrder(string $orderId, string $uniqueKey): array
    {
        $orderId = trim($orderId);

        if ($orderId === '') {
            throw new RuntimeException('PayPal order ID is required.');
        }

        $order = $this->request(
            'GET',
            '/v2/checkout/orders/' . rawurlencode($orderId)
        );

        if (($order['status'] ?? null) === 'COMPLETED') {
            return $this->ensureCustomId($order, $uniqueKey);
        }

        if (($order['status'] ?? null) !== 'APPROVED') {
            throw new RuntimeException(
                'PayPal order has not been approved. Current status: '
                . ($order['status'] ?? 'unknown')
            );
        }

        try {
            $captureResponse = $this->request(
                'POST',
                '/v2/checkout/orders/' . rawurlencode($orderId) . '/capture',
                new \stdClass(),
                substr(hash('sha256', $uniqueKey . ':capture'), 0, 32)
            );

            return $this->ensureCustomId($captureResponse, $uniqueKey, $order);
        } catch (RuntimeException $exception) {
            if (str_contains($exception->getMessage(), 'ORDER_ALREADY_CAPTURED')) {
                $refetched = $this->request(
                    'GET',
                    '/v2/checkout/orders/' . rawurlencode($orderId)
                );

                if (($refetched['status'] ?? null) === 'COMPLETED') {
                    return $this->ensureCustomId($refetched, $uniqueKey, $order);
                }
            }

            throw $exception;
        }
    }

    private function ensureCustomId(array $orderData, string $uniqueKey, ?array $originalOrder = null): array
    {
        if (isset($orderData['purchase_units'][0])) {
            $customId = $orderData['purchase_units'][0]['custom_id']
                ?? ($originalOrder['purchase_units'][0]['custom_id'] ?? null)
                ?? ($orderData['purchase_units'][0]['payments']['captures'][0]['custom_id'] ?? null)
                ?? ($orderData['purchase_units'][0]['reference_id'] ?? null)
                ?? $uniqueKey;

            $orderData['purchase_units'][0]['custom_id'] = $customId;
        }

        return $orderData;
    }

    public function verifyWebhookSignature(
        array $headers,
        array $event
    ): bool {
        $webhookId = trim(
            (string) ($this->configuration['webhook_id'] ?? '')
        );

        if ($webhookId === '') {
            throw new RuntimeException(
                'PayPal webhook ID is not configured.'
            );
        }

        $normalizedHeaders = [];
        foreach ($headers as $headerKey => $headerValue) {
            if (is_string($headerKey)) {
                $normalizedHeaders[strtolower(trim($headerKey))] = $headerValue;
            }
        }

        $headerNames = [
            'auth_algo' => 'paypal-auth-algo',
            'cert_url' => 'paypal-cert-url',
            'transmission_id' => 'paypal-transmission-id',
            'transmission_sig' => 'paypal-transmission-sig',
            'transmission_time' => 'paypal-transmission-time',
        ];

        $verificationRequest = [];

        foreach ($headerNames as $field => $headerName) {
            $value = $normalizedHeaders[$headerName] ?? null;

            if (!is_string($value) || trim($value) === '') {
                throw new RuntimeException(
                    'PayPal webhook signature headers are incomplete.'
                );
            }

            $verificationRequest[$field] = trim($value);
        }

        $verificationRequest['webhook_id'] = $webhookId;
        $verificationRequest['webhook_event'] = $event;

        $verification = $this->request(
            'POST',
            '/v1/notifications/verify-webhook-signature',
            $verificationRequest
        );

        return ($verification['verification_status'] ?? null) === 'SUCCESS';
    }

    private function request(
        string $method,
        string $path,
        array|\stdClass|null $body = null,
        ?string $requestId = null,
        bool $isRetry = false
    ): array {
        if (!function_exists('curl_init')) {
            throw new RuntimeException(
                'The PHP cURL extension is required for PayPal.'
            );
        }

        [$clientId, $clientSecret] = $this->credentials();

        $baseUrl = $this->baseUrl();
        $accessToken = $this->accessToken(
            $baseUrl,
            $clientId,
            $clientSecret,
            $isRetry
        );

        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json',
            'Content-Type: application/json',
        ];

        if ($requestId !== null) {
            $headers[] = 'PayPal-Request-Id: ' . $requestId;
        }

        $curl = curl_init($baseUrl . $path);
        if ($curl === false) {
            throw new RuntimeException('Failed to initialize cURL.');
        }

        curl_setopt_array($curl, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        if ($body !== null) {
            curl_setopt(
                $curl,
                CURLOPT_POSTFIELDS,
                json_encode($body, JSON_THROW_ON_ERROR)
            );
        }

        $responseBody = curl_exec($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curl);

        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException(
                'PayPal network request failed: ' . $curlError
            );
        }

        $response = json_decode($responseBody, true);

        if (!is_array($response)) {
            error_log(
                'PayPal returned a non-JSON response. HTTP status: '
                . $statusCode
            );

            throw new RuntimeException(
                'PayPal returned an invalid response.'
            );
        }

        if ($statusCode === 401 && !$isRetry) {
            $this->cachedAccessToken = null;
            $this->accessTokenExpiresAt = 0;
            return $this->request($method, $path, $body, $requestId, true);
        }

        if ($statusCode < 200 || $statusCode >= 300) {
            $errorName = $response['name'] ?? $response['error'] ?? 'UNKNOWN_ERROR';
            $errorMessage = $response['message'] ?? $response['error_description'] ?? 'Unknown error';
            $details = [];

            foreach (($response['details'] ?? []) as $detail) {
                if (is_array($detail)) {
                    $details[] = [
                        'issue' => $detail['issue'] ?? null,
                        'description' => $detail['description'] ?? null,
                    ];
                }
            }

            error_log('PayPal API error: ' . json_encode([
                'method' => $method,
                'path' => $path,
                'http_status' => $statusCode,
                'name' => $errorName,
                'message' => $errorMessage,
                'details' => $details,
            ], JSON_UNESCAPED_SLASHES));

            $issueDetails = [];
            foreach ($details as $d) {
                if (!empty($d['issue'])) {
                    $issueDetails[] = $d['issue'] . (!empty($d['description']) ? ' (' . $d['description'] . ')' : '');
                }
            }

            $detailString = !empty($issueDetails) ? ' [' . implode(', ', $issueDetails) . ']' : '';

            throw new RuntimeException(
                'PayPal request failed with HTTP ' . $statusCode
                . ': ' . $errorName . ' - ' . $errorMessage . $detailString
            );
        }

        return $response;
    }

    private function accessToken(
        string $baseUrl,
        string $clientId,
        string $clientSecret,
        bool $forceRefresh = false
    ): string {
        if (
            !$forceRefresh &&
            $this->cachedAccessToken !== null &&
            time() < $this->accessTokenExpiresAt
        ) {
            return $this->cachedAccessToken;
        }

        $curl = curl_init($baseUrl . '/v1/oauth2/token');
        if ($curl === false) {
            throw new RuntimeException('Failed to initialize cURL for PayPal authentication.');
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
            CURLOPT_USERPWD => $clientId . ':' . $clientSecret,
            CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Accept-Language: en_US',
                'Content-Type: application/x-www-form-urlencoded',
            ],
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $responseBody = curl_exec($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curl);

        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException(
                'PayPal authentication network error: ' . $curlError
            );
        }

        $response = json_decode($responseBody, true);

        if (
            $statusCode < 200 ||
            $statusCode >= 300 ||
            !is_array($response)
        ) {
            $errorName = is_array($response)
                ? ($response['error'] ?? $response['name'] ?? 'UNKNOWN_ERROR')
                : 'INVALID_RESPONSE';

            $errorDescription = is_array($response)
                ? ($response['error_description'] ?? $response['message'] ?? '')
                : '';

            error_log('PayPal OAuth error: ' . json_encode([
                'http_status' => $statusCode,
                'error' => $errorName,
                'description' => $errorDescription,
            ], JSON_UNESCAPED_SLASHES));

            throw new RuntimeException(
                'PayPal authentication failed with HTTP ' . $statusCode
                . ': ' . $errorName . ($errorDescription !== '' ? ' - ' . $errorDescription : '')
            );
        }

        $accessToken = $response['access_token'] ?? null;

        if (!is_string($accessToken) || $accessToken === '') {
            throw new RuntimeException(
                'PayPal did not return an access token.'
            );
        }

        $expiresIn = (int) ($response['expires_in'] ?? 3600);
        $this->cachedAccessToken = $accessToken;
        $this->accessTokenExpiresAt = time() + max(60, $expiresIn - 60);

        return $accessToken;
    }
}
