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

    public function allForAdmin(): array
    {
        $statement = $this->database()->query(
            'SELECT id, title, slug, category, description, lessons_count, duration_hours, price, old_price,
                level, students_count, rating, badge, icon, gradient, pdf_url, status
            FROM courses ORDER BY created_at DESC'
        );
        return $statement->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT id, title, slug, category, description, lessons_count, duration_hours, price, old_price,
                level, students_count, rating, badge, icon, gradient, pdf_url, status
            FROM courses WHERE id = :id LIMIT 1'
        );
        $statement->execute(['id' => $id]);
        $course = $statement->fetch();
        return $course === false ? null : $course;
    }

    public function setPdfUrl(int $id, ?string $fileName): ?array
    {
        $statement = $this->database()->prepare(
            'UPDATE courses SET pdf_url = :pdf_url WHERE id = :id'
        );
        $statement->execute(['pdf_url' => $fileName, 'id' => $id]);
        return $this->findById($id);
    }

    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        $statement = $this->database()->prepare('SELECT id FROM courses WHERE slug = :slug');
        $statement->execute(['slug' => $slug]);
        $row = $statement->fetch();
        if ($row === false) {
            return false;
        }
        return $ignoreId === null || (int) $row['id'] !== $ignoreId;
    }

    public function create(array $data): array
    {
        $statement = $this->database()->prepare(
            'INSERT INTO courses (title, slug, category, description, lessons_count, duration_hours,
                price, old_price, level, badge, status, pdf_url)
             VALUES (:title, :slug, :category, :description, :lessons_count, :duration_hours,
                :price, :old_price, :level, :badge, :status, :pdf_url)'
        );
        $statement->execute([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'category' => $data['category'],
            'description' => $data['description'] ?? null,
            'lessons_count' => $data['lessons_count'] ?? 0,
            'duration_hours' => $data['duration_hours'] ?? 0,
            'price' => $data['price'],
            'old_price' => $data['old_price'] ?? null,
            'level' => $data['level'] ?? 'Beginner',
            'badge' => $data['badge'] ?? null,
            'status' => $data['status'] ?? 'draft',
            'pdf_url' => $data['pdf_url'] ?? null,
        ]);
        $created = $this->findById((int) $this->database()->lastInsertId());
        return $created ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        $statement = $this->database()->prepare(
            'UPDATE courses SET title = :title, slug = :slug, category = :category,
                description = :description, lessons_count = :lessons_count,
                duration_hours = :duration_hours, price = :price, old_price = :old_price,
                level = :level, badge = :badge, status = :status, pdf_url = :pdf_url
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'title' => $data['title'],
            'slug' => $data['slug'],
            'category' => $data['category'],
            'description' => $data['description'] ?? null,
            'lessons_count' => $data['lessons_count'] ?? 0,
            'duration_hours' => $data['duration_hours'] ?? 0,
            'price' => $data['price'],
            'old_price' => $data['old_price'] ?? null,
            'level' => $data['level'] ?? 'Beginner',
            'badge' => $data['badge'] ?? null,
            'status' => $data['status'] ?? 'draft',
            'pdf_url' => $data['pdf_url'] ?? null,
        ]);
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->database()->prepare('DELETE FROM courses WHERE id = :id');
        $statement->execute(['id' => $id]);
        return $statement->rowCount() === 1;
    }
}
