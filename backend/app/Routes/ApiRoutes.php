<?php

declare(strict_types=1);

namespace App\Routes;

use App\Controllers\AuthController;
use App\Controllers\CourseController;
use App\Controllers\CoursePdfController;
use App\Controllers\EnrollmentController;
use App\Controllers\AdminController;
use App\Controllers\PaymentController;
use App\Controllers\WalletController;
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
        $coursePdfs = new CoursePdfController();
        $enrollments = new EnrollmentController();
        $admin = new AdminController();
        $payments = new PaymentController();
        $wallet = new WalletController();

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

        // Stream the course PDF (auth + active enrollment required).
        // The file itself is never reachable by direct URL.
        $router->get('/api/v1/courses/{id}/pdf', static function (
            Request $request,
            Response $response,
            array $parameters
        ) use ($coursePdfs, $guard): never {
            $id = filter_var(
                $parameters[0] ?? null,
                FILTER_VALIDATE_INT
            );
            if ($id === false || $id < 1) {
                $response->error('Invalid course id.', 400);
            }
            $coursePdfs->stream(
                $id,
                $guard->user($request, $response),
                $response
            );
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

        $router->get('/api/v1/enrollments', static function (
            Request $request,
            Response $response
        ) use ($enrollments, $guard): never {
            $enrollments->index(
                $guard->user($request, $response),
                $response
            );
        });

        // =========================
        // Wallet & withdrawals (authenticated user)
        // =========================

        $router->get('/api/v1/wallet', static function (
            Request $request,
            Response $response
        ) use ($wallet, $guard): never {
            $wallet->show($guard->user($request, $response), $response);
        });

        $router->post('/api/v1/wallet/withdraw', static function (
            Request $request,
            Response $response
        ) use ($wallet, $guard): never {
            $wallet->requestWithdrawal(
                $request,
                $guard->user($request, $response),
                $response
            );
        });

        $router->get('/api/v1/wallet/withdrawals', static function (
            Request $request,
            Response $response
        ) use ($wallet, $guard): never {
            $wallet->myWithdrawals($guard->user($request, $response), $response);
        });

        $router->post('/api/v1/payments/paypal/orders', static function (
            Request $request,
            Response $response
        ) use ($payments, $guard): never {
            $payments->createOrder(
                $request,
                $guard->user($request, $response),
                $response
            );
        });

        $router->post('/api/v1/payments/paypal/capture', static function (
            Request $request,
            Response $response
        ) use ($payments, $guard): never {
            $payments->captureOrder(
                $request,
                $guard->user($request, $response),
                $response
            );
        });

        $router->post('/paypal/responce', static function (
            Request $request,
            Response $response
        ) use ($payments): never {
            $payments->paypalWebhook($request, $response);
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

        $router->post('/api/v1/admin/enrollments/{id}/reject', static function (
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

            $admin->rejectEnrollment($enrollmentId, $response);
        });

        // ---- Admin withdrawal management ----
        $router->get('/api/v1/admin/withdrawals', static function (
            Request $request,
            Response $response
        ) use ($wallet, $adminGuard): never {
            $adminGuard->user($request, $response);
            $wallet->listForAdmin($response);
        });

        $router->post('/api/v1/admin/withdrawals/{id}/{action}', static function (
            Request $request,
            Response $response,
            array $parameters
        ) use ($wallet, $adminGuard): never {
            $adminGuard->user($request, $response);
            $withdrawalId = filter_var($parameters[0] ?? null, FILTER_VALIDATE_INT);
            $action = (string) ($parameters[1] ?? '');
            if ($withdrawalId === false || $withdrawalId < 1) {
                $response->error('Invalid withdrawal id.', 400);
            }
            $wallet->setStatus($withdrawalId, $action, $request, $response);
        });

        // ---- Admin course management ----
        $router->get('/api/v1/admin/courses', static function (
            Request $request,
            Response $response
        ) use ($admin, $adminGuard): never {
            $adminGuard->user($request, $response);
            $admin->listCourses($response);
        });

        // List PDF files available in backend/storage/pdfs/
        $router->get('/api/v1/admin/pdfs', static function (
            Request $request,
            Response $response
        ) use ($coursePdfs, $adminGuard): never {
            $adminGuard->user($request, $response);
            $coursePdfs->listFiles($response);
        });

        // Upload a PDF and bind it to a course (multipart field "pdf")
        $router->post('/api/v1/admin/courses/{id}/pdf', static function (
            Request $request,
            Response $response,
            array $parameters
        ) use ($coursePdfs, $adminGuard): never {
            $adminUser = $adminGuard->user($request, $response);
            $courseId = filter_var($parameters[0] ?? null, FILTER_VALIDATE_INT);
            if ($courseId === false || $courseId < 1) {
                $response->error('Invalid course id.', 400);
            }
            $coursePdfs->upload($courseId, $adminUser, $response);
        });

        $router->post('/api/v1/admin/courses', static function (
            Request $request,
            Response $response
        ) use ($admin, $adminGuard): never {
            $adminGuard->user($request, $response);
            $admin->createCourse($request, $response);
        });

        $router->put('/api/v1/admin/courses/{id}', static function (
            Request $request,
            Response $response,
            array $parameters
        ) use ($admin, $adminGuard): never {
            $adminGuard->user($request, $response);
            $courseId = filter_var($parameters[0] ?? null, FILTER_VALIDATE_INT);
            if ($courseId === false || $courseId < 1) {
                $response->error('Invalid course id.', 400);
            }
            $admin->updateCourse($courseId, $request, $response);
        });

        $router->delete('/api/v1/admin/courses/{id}', static function (
            Request $request,
            Response $response,
            array $parameters
        ) use ($admin, $adminGuard): never {
            $adminGuard->user($request, $response);
            $courseId = filter_var($parameters[0] ?? null, FILTER_VALIDATE_INT);
            if ($courseId === false || $courseId < 1) {
                $response->error('Invalid course id.', 400);
            }
            $admin->deleteCourse($courseId, $response);
        });
    }
}