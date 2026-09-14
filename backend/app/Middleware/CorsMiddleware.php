<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

final class CorsMiddleware
{
    public function handle(Request $request, Response $response): void
    {
        global $config;
        header('Access-Control-Allow-Origin: ' . $config['cors_origin']);
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

        if ($request->method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
