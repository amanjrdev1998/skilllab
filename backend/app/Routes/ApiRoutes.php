<?php

declare(strict_types=1);

namespace App\Routes;

use App\Controllers\AuthController;
use App\Controllers\CourseController;
use App\Controllers\EnrollmentController;
use App\Controllers\AdminController;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;

final class ApiRoutes
{
    public static function register(Router $router): void
    {
        $auth = new AuthController();
        $courses = new CourseController();
        $enrollments = new EnrollmentController();
        $admin = new AdminController();

        $guard = new AuthMiddleware();
        $adminGuard = new AdminMiddleware();

        // =========================
        // Health
        // =========================

        $router->get('/api/v1/health', static function (
            Request $request,
            Response $response
        ): never {
            $response->success([
                'service' => 'skilllab-api',
                'status' => 'ok'
            ]);
        });


        // =========================
        // Auth APIs
        // =========================

        $router->post('/api/v1/auth/register', [$auth, 'register']);

        $router->post('/api/v1/auth/login', [$auth, 'login']);

        $router->post('/api/v1/auth/logout', [$auth, 'logout']);

        $router->get('/api/v1/auth/me', static function (
            Request $request,
            Response $response
        ) use ($auth, $guard): never {

            $auth->me(
                $guard->user($request, $response),
                $response
            );
        });


        // =========================
        // Course APIs
        // =========================

        $router->get('/api/v1/courses', static function (
            Request $request,
            Response $response
        ) use ($courses): never {

            $courses->index($response);
        });


        $router->get('/api/v1/courses/{id}', static function (
            Request $request,
            Response $response,
            array $parameters
        ) use ($courses): never {

            $id = filter_var(
                $parameters[0] ?? null,
                FILTER_VALIDATE_INT
            );

            if ($id === false || $id < 1) {
                $response->error('Invalid course id.', 400);
            }

            $courses->show($response, $id);
        });

        $router->post('/api/v1/enrollments', static function (
            Request $request,
            Response $response
        ) use ($enrollments, $guard): never {
            $enrollments->create(
                $request,
                $guard->user($request, $response),
                $response
            );
        });


        // =========================
        // ADMIN APIs
        // =========================

        // Get all users
        $router->get('/api/v1/admin/users', static function (
            Request $request,
            Response $response
        ) use ($admin, $adminGuard): never {

            $adminUser = $adminGuard->user($request, $response);

            $admin->users($response);
        });


        // Get dashboard data
        // Users + Courses
        $router->get('/api/v1/admin/dashboard', static function (
            Request $request,
            Response $response
        ) use ($admin, $adminGuard): never {

            $adminUser = $adminGuard->user($request, $response);

            $admin->dashboard($response);
        });

        $router->post('/api/v1/admin/enrollments/{id}/approve', static function (
            Request $request,
            Response $response,
            array $parameters
        ) use ($admin, $adminGuard): never {
            $adminGuard->user($request, $response);

            $enrollmentId = filter_var(
                $parameters[0] ?? null,
                FILTER_VALIDATE_INT
            );
            if ($enrollmentId === false || $enrollmentId < 1) {
                $response->error('Invalid enrollment id.', 400);
            }

            $admin->approveEnrollment($enrollmentId, $response);
        });
    }
}