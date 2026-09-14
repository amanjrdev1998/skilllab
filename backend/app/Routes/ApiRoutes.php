<?php

declare(strict_types=1);

namespace App\Routes;

use App\Controllers\AuthController;
use App\Controllers\CourseController;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Middleware\AuthMiddleware;

final class ApiRoutes
{
    public static function register(Router $router): void
    {
        $auth = new AuthController();
        $courses = new CourseController();
        $guard = new AuthMiddleware();

        $router->get('/api/v1/health', static function (Request $request, Response $response): never {
            $response->success(['service' => 'skilllab-api', 'status' => 'ok']);
        });
        $router->post('/api/v1/auth/register', [$auth, 'register']);
        $router->post('/api/v1/auth/login', [$auth, 'login']);
        $router->post('/api/v1/auth/logout', [$auth, 'logout']);
        $router->get('/api/v1/auth/me', static function (Request $request, Response $response) use ($auth, $guard): never {
            $auth->me($guard->user($request, $response), $response);
        });

        $router->get('/api/v1/courses', static function (Request $request, Response $response) use ($courses, $guard): never {
            $courses->index($response);
        });
        
        $router->get('/api/v1/courses/{id}', static function (Request $request, Response $response, array $parameters) use ($courses): never {
            $id = filter_var($parameters[0] ?? null, FILTER_VALIDATE_INT);

            if ($id === false || $id < 1) {
                $response->error('Invalid course id.', 400);
            }

            $courses->show($response, $id);
        });
    }
}
