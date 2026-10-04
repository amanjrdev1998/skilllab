<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;

final class AdminMiddleware
{
    private AuthMiddleware $auth;

    public function __construct(?AuthMiddleware $auth = null)
    {
        $this->auth = $auth ?? new AuthMiddleware();
    }

    public function user(Request $request, Response $response): array
    {
        $user = $this->auth->user($request, $response);

        if (($user['role'] ?? null) !== 'admin') {
            $response->error('Administrator access required.', 403);
        }

        return $user;
    }
}