<?php

declare(strict_types=1);

$envFile = dirname(__DIR__) . '/.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
    }
}
// php -S localhost:8000 -t backend/public backend/public/index.php
return [
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
    'url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
    'cors_origin' => $_ENV['CORS_ORIGIN'] ?? 'http://localhost:3000',
    'database' => [
        'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
        'port' => $_ENV['DB_PORT'] ?? '3306',
        'name' => $_ENV['DB_NAME'] ?? 'skilllab',
        'user' => $_ENV['DB_USER'] ?? 'root',
        'password' => $_ENV['DB_PASSWORD'] ?? '',
    ],
    'paypal' => [
        'environment' => $_ENV['PAYPAL_ENV'] ?? 'sandbox',
        'client_id' => $_ENV['PAYPAL_CLIENT_ID'] ?? '',
        'client_secret' => $_ENV['PAYPAL_CLIENT_SECRET'] ?? '',
        'webhook_id' => $_ENV['PAYPAL_WEBHOOK_ID'] ?? '',
        'currency' => strtoupper($_ENV['PAYPAL_CURRENCY'] ?? 'USD'),
    ],
    'referral' => [
        // % of the course price credited to the referral-code owner's wallet.
        'commission_percent' => (float) ($_ENV['REFERRAL_COMMISSION_PERCENT'] ?? 10),
        // Minimum wallet amount a user can request to withdraw.
        'min_withdrawal' => (float) ($_ENV['MIN_WITHDRAWAL_AMOUNT'] ?? 100),
    ],
    'notifications' => [
        'whatsapp_enabled' => filter_var($_ENV['NOTIFY_WHATSAPP_ENABLED'] ?? false, FILTER_VALIDATE_BOOLEAN),
        'whatsapp_url' => rtrim((string) ($_ENV['NOTIFY_WHATSAPP_URL'] ?? 'http://localhost:3001'), '/'),
        'admin_whatsapp' => (string) ($_ENV['ADMIN_WHATSAPP_NUMBER'] ?? ''),
        'email_enabled' => filter_var($_ENV['NOTIFY_EMAIL_ENABLED'] ?? false, FILTER_VALIDATE_BOOLEAN),
        'admin_email' => (string) ($_ENV['ADMIN_EMAIL'] ?? ''),
        'from_email' => (string) ($_ENV['MAIL_FROM'] ?? 'noreply@skilllab.store'),
    ],
];
