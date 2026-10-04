<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;

final class AdminRepository
{
    private ?PDO $database = null;

    private function database(): PDO
    {
        return $this->database ??= Database::connection();
    }

    public function students(): array
    {
        $statement = $this->database()->query(
            "SELECT id, name, email, phone, referral_code, status, created_at
             FROM users
             WHERE role = 'student'
             ORDER BY created_at DESC"
        );

        return $statement->fetchAll();
    }

    public function publishedCourses(): array
    {
        $statement = $this->database()->query(
            "SELECT id, title, category, lessons_count, price, students_count, status
             FROM courses
             WHERE status = 'published'
             ORDER BY created_at DESC"
        );

        return $statement->fetchAll();
    }

    public function enrollments(): array
    {
        $statement = $this->database()->query(
            'SELECT enrollments.id, enrollments.user_id, enrollments.course_id,
                    users.name AS student_name, users.email AS student_email,
                    users.phone AS student_phone, courses.title AS course_name,
                    enrollments.order_id, enrollments.status, enrollments.progress, enrollments.price_paid,
                    enrollments.referral_code, enrollments.utr, enrollments.enrolled_at
             FROM enrollments
             INNER JOIN users ON users.id = enrollments.user_id
             INNER JOIN courses ON courses.id = enrollments.course_id
             ORDER BY enrollments.enrolled_at DESC'
        );

        return $statement->fetchAll();
    }

    public function activatePendingEnrollment(int $enrollmentId): bool
    {
        $statement = $this->database()->prepare(
            "UPDATE enrollments
             SET status = 'active'
             WHERE id = :id AND status = 'pending'"
        );
        $statement->execute(['id' => $enrollmentId]);

        return $statement->rowCount() === 1;
    }
}
