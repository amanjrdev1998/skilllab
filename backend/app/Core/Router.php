<?php

declare(strict_types=1);

namespace App\Core;

final class Router
{
    private array $routes = [];

    public function __construct(
        private readonly Request $request,
        private readonly Response $response,
    ) {
    }

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $this->routes[] = compact('method', 'path', 'handler');
    }

    public function dispatch(): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $this->request->method()) {
                continue;
            }

            $pattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $route['path']);
            if ($pattern !== null && preg_match('#^' . $pattern . '$#', $this->request->path(), $matches)) {
                array_shift($matches);
                ($route['handler'])($this->request, $this->response, $matches);
                return;
            }
        }

        $this->response->error('Route not found.', 404);
    }
}
