<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;

final class CourseRepository
{
    private ?PDO $database = null;

    private function database(): PDO
    {
        return $this->database ??= Database::connection();
    }

    public function all(): array
    {
        $statement = $this->database()->query(
            'SELECT id, title, slug, category, description, lessons_count, duration_hours, price, old_price,
                level, students_count, rating, badge, icon, gradient, pdf_url, status
            FROM courses WHERE status = "published" ORDER BY created_at DESC'
        );
        return $statement->fetchAll();

       

    }

    public function findPublishedById(int $id): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT id, title, slug, category, description, lessons_count, duration_hours, price, old_price,
                level, students_count, rating, badge, icon, gradient, pdf_url, status
            FROM courses WHERE id = :id AND status = "published" LIMIT 1'
        );
        $statement->execute(['id' => $id]);

        $course = $statement->fetch();
        return $course === false ? null : $course;
    }
}
