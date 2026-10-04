<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;

final class EnrollmentRepository
{
    private ?PDO $database = null;

    private function database(): PDO
    {
        return $this->database ??= Database::connection();
    }

    public function createPending(int $userId, int $courseId): ?array
    {
        $orderId = 'SL-' . strtoupper(bin2hex(random_bytes(12)));
        $statement = $this->database()->prepare(
            "INSERT INTO enrollments (user_id, course_id, course_name, order_id, status, price_paid)
             SELECT :user_id, id, title, :order_id, 'pending', price
             FROM courses
             WHERE id = :course_id AND status = 'published'"
        );
        $statement->execute([
            'user_id' => $userId,
            'order_id' => $orderId,
            'course_id' => $courseId,
        ]);

        return $statement->rowCount() === 1
            ? [
                'enrollment_id' => (int) $this->database()->lastInsertId(),
                'order_id' => $orderId,
            ]
            : null;
    }
}
