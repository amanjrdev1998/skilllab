<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Repositories\CourseRepository;
use App\Repositories\EnrollmentRepository;

/**
 * Serves course PDFs from backend/storage/pdfs/ (outside the web root).
 *
 * PDFs are NEVER reachable by direct URL. The student endpoint requires a
 * valid login AND an active (non-cancelled) enrollment for the course;
 * admins bypass the enrollment check.
 */
final class CoursePdfController
{
    private CourseRepository $courses;
    private EnrollmentRepository $enrollments;

    public function __construct(
        ?CourseRepository $courses = null,
        ?EnrollmentRepository $enrollments = null
    ) {
        $this->courses = $courses ?? new CourseRepository();
        $this->enrollments = $enrollments ?? new EnrollmentRepository();
    }

    private function storageDir(): string
    {
        return __DIR__ . '/../../storage/pdfs';
    }

    /**
     * Resolve a pdf_url filename to a real path inside the storage dir.
     * Returns null when the name is unsafe or the file is missing.
     */
    public function resolvePdfPath(?string $fileName): ?string
    {
        if ($fileName === null || $fileName === '') {
            return null;
        }
        if (!preg_match('/^[A-Za-z0-9._-]+\.pdf$/i', $fileName)) {
            return null;
        }
        $realBase = realpath($this->storageDir());
        if ($realBase === false) {
            return null;
        }
        $real = realpath($realBase . DIRECTORY_SEPARATOR . basename($fileName));
        if ($real === false) {
            return null;
        }
        if (strpos($real, $realBase . DIRECTORY_SEPARATOR) !== 0) {
            return null;
        }
        if (strtolower((string) pathinfo($real, PATHINFO_EXTENSION)) !== 'pdf') {
            return null;
        }
        return $real;
    }

    /**
     * GET /api/v1/courses/{id}/pdf — stream the bound PDF inline.
     */
    public function stream(int $courseId, array $user, Response $response): never
    {
        $course = $this->courses->findById($courseId);
        if ($course === null) {
            $response->error('Course not found.', 404);
        }

        $isAdmin = ($user['role'] ?? 'student') === 'admin';
        if (!$isAdmin && !$this->enrollments->hasActiveEnrollment((int) $user['id'], $courseId)) {
            $response->error('You are not enrolled in this course.', 403);
        }

        $path = $this->resolvePdfPath($course['pdf_url'] ?? null);
        if ($path === null) {
            $response->error('No PDF is attached to this course yet.', 404);
        }

        $size = filesize($path);
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        http_response_code(200);
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . basename($path) . '"');
        header('Content-Length: ' . $size);
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: private, no-store, max-age=0');
        header('Accept-Ranges: bytes');
        readfile($path);
        exit;
    }

    /**
     * GET /api/v1/admin/pdfs — list PDF filenames available in storage.
     */
    public function listFiles(Response $response): never
    {
        $files = [];
        $realBase = realpath($this->storageDir());
        if ($realBase !== false) {
            foreach ((array) scandir($realBase) as $entry) {
                if ($entry === '.' || $entry === '..') {
                    continue;
                }
                if (preg_match('/\.pdf$/i', $entry) && is_file($realBase . DIRECTORY_SEPARATOR . $entry)) {
                    $files[] = $entry;
                }
            }
            sort($files);
        }
        $response->success(['pdfs' => $files, 'total' => count($files)]);
    }

    /**
     * POST /api/v1/admin/courses/{id}/pdf — upload a PDF and bind it to the course.
     * Expects multipart field "pdf".
     */
    public function upload(int $courseId, array $user, Response $response): never
    {
        $course = $this->courses->findById($courseId);
        if ($course === null) {
            $response->error('Course not found.', 404);
        }

        $file = $_FILES['pdf'] ?? null;
        if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $response->error('No PDF file was uploaded (field name must be "pdf").', 422);
        }
        if (($file['size'] ?? 0) > 25 * 1024 * 1024) {
            $response->error('The PDF must be 25 MB or smaller.', 422);
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        $ext = strtolower((string) pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        if ($ext !== 'pdf' || $mime !== 'application/pdf') {
            $response->error('Only PDF files are allowed.', 422);
        }

        $stem = (string) preg_replace('/[^A-Za-z0-9._-]+/', '_', (string) pathinfo((string) $file['name'], PATHINFO_FILENAME));
        $stem = trim($stem, '._-');
        if ($stem === '') {
            $stem = 'course-pdf';
        }
        $fileName = 'course-' . $courseId . '-' . substr($stem, 0, 80) . '.pdf';

        $realBase = realpath($this->storageDir());
        if ($realBase === false) {
            mkdir($this->storageDir(), 0755, true);
            $realBase = realpath($this->storageDir());
        }
        if ($realBase === false) {
            $response->error('PDF storage is not available.', 500);
        }

        if (!move_uploaded_file($file['tmp_name'], $realBase . DIRECTORY_SEPARATOR . $fileName)) {
            $response->error('Could not save the uploaded PDF.', 500);
        }

        $updated = $this->courses->setPdfUrl($courseId, $fileName);
        $response->success(['course' => $updated, 'pdf_url' => $fileName]);
    }
}
