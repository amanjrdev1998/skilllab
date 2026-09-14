<?php

declare(strict_types=1);

namespace App\Core;

final class Response
{
    public function json(array $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES);
        exit;
    }

    public function success(mixed $data, int $status = 200): never
    {

        $this->json(['success' => true, 'data' => $data], $status);
    }

    public function error(string $message, int $status = 400, array $errors = []): never
    {
        $payload = ['success' => false, 'message' => $message];
        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        $this->json($payload, $status);
    }
}
