<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use PDO;
use PDOException;

final class UserRepository
{
    private ?PDO $database;
    
    // Remove this - you don't need both
    // private Database $db;

    public function __construct(?PDO $database = null)
    {
        $this->database = $database;
    }

    private function database(): PDO
    {
        return $this->database ??= Database::connection();
    }

    public function findByEmail(string $email): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = :email LIMIT 1'
        );
        $statement->execute(['email' => strtolower(trim($email))]);
        return $statement->fetch() ?: null;
    }

    public function findByphone(string $phone): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT id, name, email, password_hash, role FROM users WHERE phone = :phone LIMIT 1'
        );
        $statement->execute(['phone' => trim($phone)]);
        return $statement->fetch() ?: null;
    }

    public function findByReferralCode(string $referralCode): ?array
    {
        $pdo = $this->database(); // Changed from $this->db
        $statement = $pdo->prepare(
            'SELECT * FROM users WHERE referral_code = :referral_code'
        );
        $statement->execute(['referral_code' => $referralCode]);
        $result = $statement->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function findByToken(string $token): ?array
    {
        $statement = $this->database()->prepare(
            'SELECT users.id, users.name, users.email, users.role
             FROM api_tokens JOIN users ON users.id = api_tokens.user_id
             WHERE api_tokens.token_hash = :token_hash AND api_tokens.expires_at > NOW() LIMIT 1'
        );
        $statement->execute(['token_hash' => hash('sha256', $token)]);
        return $statement->fetch() ?: null;
    }

    public function create(string $name, string $email, string $password, string $phone = '', string $referralCode = null): array
{
    $statement = $this->database()->prepare(
        'INSERT INTO users (name, email, password_hash, phone, referral_code, status)
         VALUES (:name, :email, :password_hash, :phone, :referral_code, :status)'
    );
    $statement->execute([
        'name' => trim($name),
        'email' => strtolower(trim($email)),
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'phone' => trim($phone) !== '' ? trim($phone) : null,
        'referral_code' => $referralCode,
        'status' => 'active'
    ]);

    return [
        'id' => (int) $this->database()->lastInsertId(),
        'name' => trim($name),
        'email' => strtolower(trim($email)),
        'phone' => trim($phone) !== '' ? trim($phone) : null,
        'referral_code' => $referralCode,
        'status' => 'active',
        'role' => 'student',
    ];
} 

        public function createToken(int $userId): array
    {
        $token = bin2hex(random_bytes(32));
        $secretKey = bin2hex(random_bytes(32));
        
        $statement = $this->database()->prepare(
            'INSERT INTO api_tokens (user_id, token_hash, secret_key, expires_at)
            VALUES (:user_id, :token_hash, :secret_key, DATE_ADD(NOW(), INTERVAL 30 DAY))'
        );
        $statement->execute([
            'user_id' => $userId,
            'token_hash' => hash('sha256', $token),
            'secret_key' => hash('sha256', $secretKey),
        ]);
        
        return [
            'user_id' => $userId,
            'token' => $token,
            'secret_key' => $secretKey,
            'expires_in' => 2592000 // 30 days in seconds
        ];
    }

    public function findById(int $id): ?array
    {
        try {
            $statement = $this->database()->prepare(
                'SELECT id, name, email, phone, referral_code, role, status, created_at 
                 FROM users WHERE id = :id'
            );
            $statement->execute(['id' => $id]);
            $result = $statement->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Error finding user by ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete/Revoke all tokens for a specific user
     */
    public function deleteUserTokens(int $userId): bool
    {
        try {
            // Option 1: Soft delete (revoke by setting expiry)
            //$statement = $this->database()->prepare(
             //   'UPDATE api_tokens 
              //   SET expires_at = NOW(), revoked_at = NOW() 
              //   WHERE user_id = :user_id AND expires_at > NOW()'
            //);
            //return $statement->execute(['user_id' => $userId]);
            
            // Option 2: Hard delete (permanently remove)
            $statement = $this->database()->prepare(
                'DELETE FROM api_tokens WHERE user_id = :user_id'
            );
             return $statement->execute(['user_id' => $userId]);
        } catch (PDOException $e) {
            error_log("Error deleting user tokens: " . $e->getMessage());
            return false;
        }
    }

     public function getUserByToken(string $token): ?array
    {
        try {
            $statement = $this->database()->prepare(
                'SELECT users.id, users.name, users.email, users.phone, 
                        users.referral_code, users.role, users.status
                 FROM api_tokens 
                 JOIN users ON users.id = api_tokens.user_id
                 WHERE api_tokens.token_hash = :token_hash 
                 AND api_tokens.expires_at > NOW() 
                 AND users.status = "active"
                 LIMIT 1'
            );
            $statement->execute(['token_hash' => hash('sha256', $token)]);
            $result = $statement->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Error getting user by token: " . $e->getMessage());
            return null;
        }
    }
    
}

// admin paswd 
// admin@skilllab.com
// skilllab@123