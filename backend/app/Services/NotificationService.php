<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Payment notifications for the admin.
 *
 * - WhatsApp: sent through the WhatsApp bridge (same API as the GO Auth
 *   bridge: POST {url}/api/sendText { chatId, text }). The bridge must be
 *   reachable from the server; configure NOTIFY_WHATSAPP_URL.
 * - Email: PHP mail() to ADMIN_EMAIL.
 *
 * Both channels are best-effort and never break the payment flow —
 * failures are only logged.
 */
final class NotificationService
{
    /**
     * @param array{course_title:string, amount:string, currency:string, user_name:string,
     *              user_email:string, capture_id:string, order_id:string,
     *              referral_code:?string, referral_amount:float} $details
     */
    public function sendPaymentReceived(array $details): void
    {
        global $config;
        $notify = $config['notifications'] ?? [];

        $lines = [
            'Payment received on SkillLab',
            '----------------------------',
            'Course: ' . $details['course_title'],
            'Amount: ' . $details['currency'] . ' ' . $details['amount'],
            'Buyer: ' . $details['user_name'] . ' (' . $details['user_email'] . ')',
            'PayPal capture: ' . $details['capture_id'],
            'PayPal order: ' . $details['order_id'],
        ];
        if (!empty($details['referral_code'])) {
            $lines[] = 'Referral: ' . $details['referral_code']
                . ' (commission ' . $details['currency'] . ' '
                . number_format((float) $details['referral_amount'], 2) . ')';
        }
        $lines[] = 'Verify it in your PayPal dashboard.';
        $message = implode("\n", $lines);

        if (!empty($notify['whatsapp_enabled']) && !empty($notify['admin_whatsapp'])) {
            $this->sendWhatsApp(
                (string) $notify['whatsapp_url'],
                (string) $notify['admin_whatsapp'],
                $message
            );
        }

        if (!empty($notify['email_enabled']) && !empty($notify['admin_email'])) {
            $this->sendEmail(
                (string) $notify['admin_email'],
                (string) ($notify['from_email'] ?? 'noreply@skilllab.store'),
                'SkillLab: payment received — ' . $details['course_title'],
                $message
            );
        }
    }

    private function sendWhatsApp(string $bridgeUrl, string $adminNumber, string $message): void
    {
        $chatId = $adminNumber;
        if (strpos($chatId, '@') === false) {
            // Plain phone number -> WhatsApp chat id.
            $chatId = preg_replace('/\D/', '', $chatId) . '@c.us';
        }
        $payload = json_encode(['chatId' => $chatId, 'text' => $message]);
        if ($payload === false) {
            return;
        }

        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\nContent-Length: " . strlen($payload),
                'content' => $payload,
                'timeout' => 10,
                'ignore_errors' => true,
            ],
        ]);

        $result = @file_get_contents(rtrim($bridgeUrl, '/') . '/api/sendText', false, $context);
        if ($result === false) {
            error_log('WhatsApp notification failed: bridge unreachable at ' . $bridgeUrl);
        }
    }

    private function sendEmail(string $to, string $from, string $subject, string $body): void
    {
        $headers = 'From: ' . $from . "\r\n"
            . 'Reply-To: ' . $from . "\r\n"
            . 'Content-Type: text/plain; charset=UTF-8';
        $sent = @mail($to, $subject, $body, $headers);
        if (!$sent) {
            error_log('Payment notification email failed for ' . $to);
        }
    }
}
