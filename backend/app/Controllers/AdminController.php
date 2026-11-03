<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\AdminRepository;
use App\Repositories\CourseRepository;

final class AdminController
{
    private AdminRepository $admin;
    private CourseRepository $courses;

    public function __construct(?AdminRepository $admin = null, ?CourseRepository $courses = null)
    {
        $this->admin = $admin ?? new AdminRepository();
        $this->courses = $courses ?? new CourseRepository();
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

    public function rejectEnrollment(int $enrollmentId, Response $response): never
    {
        if (!$this->admin->rejectPendingEnrollment($enrollmentId)) {
            $response->error(
                'Enrollment was not found or is no longer pending.',
                409
            );
        }

        $response->success([
            'enrollment_id' => $enrollmentId,
            'status' => 'cancelled',
        ]);
    }

    public function listCourses(Response $response): never
    {
        $courses = $this->courses->allForAdmin();
        $response->success(['courses' => $courses, 'total' => count($courses)]);
    }

    public function createCourse(Request $request, Response $response): never
    {
        $data = $this->validateCourseInput($request, $response);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? '', $data['title']);
        $course = $this->courses->create($data);
        $response->success(['course' => $course], 201);
    }

    public function updateCourse(int $courseId, Request $request, Response $response): never
    {
        if ($this->courses->findById($courseId) === null) {
            $response->error('Course not found.', 404);
        }
        $data = $this->validateCourseInput($request, $response);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? '', $data['title'], $courseId);
        $course = $this->courses->update($courseId, $data);
        $response->success(['course' => $course]);
    }

    public function deleteCourse(int $courseId, Response $response): never
    {
        if ($this->courses->findById($courseId) === null) {
            $response->error('Course not found.', 404);
        }
        if (!$this->courses->delete($courseId)) {
            $response->error('Unable to delete the course.', 500);
        }
        $response->success(['deleted' => true, 'course_id' => $courseId]);
    }

    /** @return array<string,mixed> */
    private function validateCourseInput(Request $request, Response $response): array
    {
        $title = trim((string) $request->input('title', ''));
        $category = trim((string) $request->input('category', ''));
        $price = $request->input('price', null);
        $status = strtolower(trim((string) $request->input('status', 'draft')));
        $level = trim((string) $request->input('level', 'Beginner'));

        if ($title === '' || mb_strlen($title) > 180) {
            $response->error('A course title (1-180 chars) is required.', 422);
        }
        if ($category === '' || mb_strlen($category) > 120) {
            $response->error('A course category (1-120 chars) is required.', 422);
        }
        if (!is_numeric($price) || (float) $price < 0) {
            $response->error('A valid non-negative price is required.', 422);
        }
        if (!in_array($status, ['draft', 'published', 'archived'], true)) {
            $response->error('Status must be draft, published or archived.', 422);
        }
        if (!in_array($level, ['Beginner', 'Intermediate', 'Advanced'], true)) {
            $response->error('Level must be Beginner, Intermediate or Advanced.', 422);
        }

        $oldPrice = $request->input('old_price', null);
        $lessons = $request->input('lessons_count', 0);
        $hours = $request->input('duration_hours', 0);

        return [
            'title' => $title,
            'slug' => trim((string) $request->input('slug', '')),
            'category' => $category,
            'description' => trim((string) $request->input('description', '')) ?: null,
            'lessons_count' => max(0, (int) $lessons),
            'duration_hours' => max(0, (float) $hours),
            'price' => round((float) $price, 2),
            'old_price' => ($oldPrice === null || $oldPrice === '') ? null : round((float) $oldPrice, 2),
            'level' => $level,
            'badge' => trim((string) $request->input('badge', '')) ?: null,
            'status' => $status,
            'pdf_url' => $this->validatePdfFileName($request->input('pdf_url', null), $response),
        ];
    }

    /**
     * Accept only a plain PDF filename that already exists in backend/storage/pdfs/.
     * Returns the clean filename or null.
     */
    private function validatePdfFileName(mixed $value, \App\Core\Response $response): ?string
    {
        $name = trim((string) ($value ?? ''));
        if ($name === '') {
            return null;
        }
        if (!preg_match('/^[A-Za-z0-9._-]+\.pdf$/i', $name)) {
            $response->error('pdf_url must be a plain PDF file name (e.g. course-guide.pdf).', 422);
        }
        $storage = realpath(__DIR__ . '/../../storage/pdfs');
        if ($storage === false || !is_file($storage . DIRECTORY_SEPARATOR . basename($name))) {
            $response->error('The selected PDF does not exist in storage/pdfs/. Upload it first.', 422);
        }
        return basename($name);
    }

    private function uniqueSlug(string $slug, string $title, ?int $ignoreId = null): string
    {
        $base = $slug !== '' ? $slug : $title;
        $base = strtolower(trim($base));
        $base = (string) preg_replace('/[^a-z0-9]+/', '-', $base);
        $base = trim($base, '-');
        if ($base === '') {
            $base = 'course';
        }
        $candidate = substr($base, 0, 190);
        $suffix = 2;
        while ($this->courses->slugExists($candidate, $ignoreId)) {
            $candidate = substr($base, 0, 185) . '-' . $suffix;
            $suffix++;
        }
        return $candidate;
    }
}
