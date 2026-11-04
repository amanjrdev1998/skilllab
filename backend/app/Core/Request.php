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

        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

        // When the API is served from a sub-path of the domain (e.g.
        // https://example.com/backend/api/v1/...), .env sets
        // API_BASE_PATH=/backend. Strip that prefix so the router can
        // match its registered paths (/api/v1/...). Without this, every
        // request under the sub-path 404s. When the API has its own
        // (sub)domain, API_BASE_PATH is empty and nothing is stripped.
        $basePath = rtrim((string) ($_ENV['API_BASE_PATH'] ?? ''), '/');
        if ($basePath !== '' && ($path === $basePath || str_starts_with($path, $basePath . '/'))) {
            $path = substr($path, strlen($basePath)) ?: '/';
        }

        return new self(
            strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'),
            $path,
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

    public function allInput(): array
    {
        return $this->body;
    }

    public function header(string $name): ?string
    {
        foreach ($this->headers as $headerName => $value) {
            if (strcasecmp($headerName, $name) === 0 && is_string($value)) {
                return $value;
            }
        }

        return null;
    }

    public function bearerToken(): ?string
    {
        $authorization = $this->header('Authorization') ?? '';
        return preg_match('/Bearer\s+(.+)/i', $authorization, $matches) ? trim($matches[1]) : null;
    }
}
