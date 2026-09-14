<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Response;
use App\Repositories\CourseRepository;

final class CourseController
{
    private CourseRepository $courses;

    public function __construct(?CourseRepository $courses = null)
    {
        $this->courses = $courses ?? new CourseRepository();
    }

    public function index(Response $response): never
    {
        $response->success(['courses' => $this->courses->all()]);
    }

    public function show(Response $response, int $id): never
    {
        $course = $this->courses->findPublishedById($id);

        if ($course === null) {
            $response->error('Course not found.', 404);
        }

        $response->success(['course' => $course]);
    }
}
