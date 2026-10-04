<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Repositories\AdminRepository;

final class AdminController
{
    private AdminRepository $admin;

    public function __construct(?AdminRepository $admin = null)
    {
        $this->admin = $admin ?? new AdminRepository();
    }

    public function users(Response $response): never
    {
        $users = $this->admin->students();
        $response->success([
            'users' => $users,
            'total' => count($users),
        ]);
    }

    public function dashboard(Response $response): never
    {
        $users = $this->admin->students();
        $courses = $this->admin->publishedCourses();
        $enrollments = $this->admin->enrollments();

        $response->success([
            'users' => $users,
            'courses' => $courses,
            'enrollments' => $enrollments,
            'statistics' => [
                'total_users' => count($users),
                'total_courses' => count($courses),
                'total_enrollments' => count($enrollments),
            ],
        ]);
    }

    public function approveEnrollment(int $enrollmentId, Response $response): never
    {
        if (!$this->admin->activatePendingEnrollment($enrollmentId)) {
            $response->error(
                'Enrollment was not found or is no longer pending.',
                409
            );
        }

        $response->success([
            'enrollment_id' => $enrollmentId,
            'status' => 'active',
        ]);
    }
}
