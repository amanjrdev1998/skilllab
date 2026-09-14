<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\UserRepository;

final class AuthMiddleware
{
    private UserRepository $users;

    public function __construct(?UserRepository $users = null)
    {
        $this->users = $users ?? new UserRepository();
    }

    public function user(Request $request, Response $response): array
    {
        $token = $request->bearerToken();
        $user = $token ? $this->users->findByToken($token) : null;

        if ($user === null) {
            $response->error('Authentication required.', 401);
        }

        return $user;
    }
}
