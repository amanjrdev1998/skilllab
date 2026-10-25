<?php

declare(strict_types=1);

namespace App\Services;

use RuntimeException;

final class PayPalClient
{
    private array $configuration;

    public function __construct()
    {
        global $config;
        $this->configuration = $config['paypal'];
    }

    public function createOrder(array $payment): array
    {
        return $this->request('POST', '/v2/checkout/orders', [
            'intent' => 'CAPTURE',
            'purchase_units' => [[
                'reference_id' => $payment['unique_key'],
                'custom_id' => $payment['unique_key'],
                'description' => $payment['title'],
                'amount' => [
                    'currency_code' => $payment['currency'],
                    'value' => number_format((float) $payment['amount'], 2, '.', ''),
                ],
            ]],
            'application_context' => [
                'shipping_preference' => 'NO_SHIPPING',
                'user_action' => 'PAY_NOW',
            ],
        ], $payment['unique_key']);
    }

    public function captureOrder(string $orderId, string $uniqueKey): array
    {
        $order = $this->request('GET', '/v2/checkout/orders/' . rawurlencode($orderId));
        if (($order['status'] ?? null) === 'COMPLETED') {
            return $order;
        }
        if (($order['status'] ?? null) !== 'APPROVED') {
            throw new RuntimeException('PayPal order has not been approved.');
        }

        return $this->request(
            'POST',
            '/v2/checkout/orders/' . rawurlencode($orderId) . '/capture',
            new \stdClass(),
            str_replace('-', '', $uniqueKey) . 'CAPT'
        );
    }

    private function request(
        string $method,
        string $path,
        array|\stdClass|null $body = null,
        ?string $requestId = null
    ): array {
        if (!function_exists('curl_init')) {
            throw new RuntimeException('The PHP cURL extension is required for PayPal payments.');
        }

        $clientId = $this->configuration['client_id'];
        $clientSecret = $this->configuration['client_secret'];
        if ($clientId === '' || $clientSecret === '') {
            throw new RuntimeException('PayPal credentials are not configured.');
        }

        $baseUrl = $this->configuration['environment'] === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
        $accessToken = $this->accessToken($baseUrl, $clientId, $clientSecret);

        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json',
            'Content-Type: application/json',
        ];
        if ($requestId !== null) {
            $headers[] = 'PayPal-Request-Id: ' . $requestId;
        }

        $curl = curl_init($baseUrl . $path);
        curl_setopt_array($curl, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30,
        ]);
        if ($body !== null) {
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_THROW_ON_ERROR));
        }

        $responseBody = curl_exec($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException('PayPal request failed: ' . $curlError);
        }

        $response = json_decode($responseBody, true);
        if (!is_array($response)) {
            throw new RuntimeException('PayPal returned an invalid response.');
        }
        if ($statusCode < 200 || $statusCode >= 300) {
            throw new RuntimeException(
                'PayPal request failed with HTTP ' . $statusCode . ': '
                . ($response['message'] ?? $response['name'] ?? 'Unknown error')
            );
        }

        return $response;
    }

    private function accessToken(string $baseUrl, string $clientId, string $clientSecret): string
    {
        $curl = curl_init($baseUrl . '/v1/oauth2/token');
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
            CURLOPT_USERPWD => $clientId . ':' . $clientSecret,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Accept-Language: en_US',
                'Content-Type: application/x-www-form-urlencoded',
            ],
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30,
        ]);

        $responseBody = curl_exec($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlError = curl_error($curl);
        curl_close($curl);

        if ($responseBody === false) {
            throw new RuntimeException('PayPal authentication failed: ' . $curlError);
        }

        $response = json_decode($responseBody, true);
        if ($statusCode < 200 || $statusCode >= 300 || !is_array($response)) {
            throw new RuntimeException('PayPal authentication failed with HTTP ' . $statusCode . '.');
        }

        $accessToken = $response['access_token'] ?? null;
        if (!is_string($accessToken) || $accessToken === '') {
            throw new RuntimeException('PayPal did not return an access token.');
        }

        return $accessToken;
    }
}
