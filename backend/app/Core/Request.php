<?php

declare(strict_types=1);

namespace App\Core;

final class Request
{
    private function __construct(
        private readonly string $method,
        private readonly string $path,
        private readonly array $body,
        private readonly array $headers,
    ) {
    }

    public static function capture(): self
    {
        $rawBody = file_get_contents('php://input') ?: '';
        $body = json_decode($rawBody, true);

        return new self(
            strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/',
            is_array($body) ? $body : [],
            function_exists('getallheaders') ? getallheaders() : [],
        );
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return rtrim($this->path, '/') ?: '/';
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function bearerToken(): ?string
    {
        $authorization = $this->headers['Authorization'] ?? $this->headers['authorization'] ?? '';
        return preg_match('/Bearer\s+(.+)/i', $authorization, $matches) ? trim($matches[1]) : null;
    }
}
