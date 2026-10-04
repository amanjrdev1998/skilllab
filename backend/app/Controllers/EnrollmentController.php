<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\EnrollmentRepository;
use PDOException;

final class EnrollmentController
{
    private EnrollmentRepository $enrollments;

    public function __construct(?EnrollmentRepository $enrollments = null)
    {
        $this->enrollments = $enrollments ?? new EnrollmentRepository();
    }

    public function create(Request $request, array $user, Response $response): never
    {
        $courseId = $request->input('course_id');
        $validatedCourseId = is_int($courseId) || is_string($courseId)
            ? filter_var($courseId, FILTER_VALIDATE_INT)
            : false;

        if ($validatedCourseId === false || $validatedCourseId < 1) {
            $response->error('A valid course id is required.', 422);
        }

        try {
            $enrollment = $this->enrollments->createPending(
                (int) $user['id'],
                $validatedCourseId,
            );
        } catch (PDOException $exception) {
            if ((int) ($exception->errorInfo[1] ?? 0) === 1062) {
                $response->error('You are already enrolled in this course.', 409);
            }

            throw $exception;
        }

        if ($enrollment === null) {
            $response->error('Course not found.', 404);
        }

        $response->success($enrollment, 201);
    }
}
