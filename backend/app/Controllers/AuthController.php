<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\UserRepository;

final class AuthController
{
    private UserRepository $users;

    public function __construct(?UserRepository $users = null)
    {
        $this->users = $users ?? new UserRepository();
    }

    public function register(Request $request, Response $response): never
    {
        $name = (string) $request->input('name', '');
        $email = (string) $request->input('email', '');
        $phone = (string) $request->input('phone', '');
        $password = (string) $request->input('password', '');

        if (trim($name) === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8) {
            $response->error('Name, a valid email, and a password of at least 8 characters are required.', 422);
        }

        if ($this->users->findByEmail($email,) !== null) {
            $response->error('An account with this email already exists.', 409);
        }

        if ($this->users->findByPhone($phone) !== null) {
            $response->error('An account with this phone number already exists.', 409);
        }

        // Generate referral code using name + phone + unique number
        $namePart = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $name), 0, 3));
        
        // Ensure name part is at least 3 characters
        while (strlen($namePart) < 3) {
            $namePart .= 'X';
        }
        
        // Take last 4 digits of phone
        $phonePart = substr(preg_replace('/\D/', '', $phone), -4);
        
        // Ensure phone part is at least 4 characters
        while (strlen($phonePart) < 4) {
            $phonePart = '0' . $phonePart;
        }
        
        // Generate unique number (timestamp + random)
        $uniquePart = strtoupper(substr(uniqid(), -4));
        
        $referralCode = $namePart . $phonePart . $uniquePart;

        // Check if referral code already exists (regenerate if duplicate)
        $attempt = 0;
        while ($this->users->findByReferralCode($referralCode) !== null && $attempt < 5) {
            $uniquePart = strtoupper(substr(uniqid(), -4));
            $referralCode = $namePart . $phonePart . $uniquePart;
            $attempt++;
        }

        // Create user with referral code
        $user = $this->users->create($name, $email, $password, $phone, $referralCode);
        
        $response->success([
            'user' => $user, 
            // 'token' => $this->users->createToken($user['id']),
            'referral_code' => $referralCode
        ], 201);
    }

    public function login(Request $request, Response $response): never
    {
        $user = $this->users->findByEmail((string) $request->input('email', ''));
        $password = (string) $request->input('password', '');

        if ($user === null || !password_verify($password, $user['password_hash'])) {
            $response->error('Invalid email or password.', 401);
        }

        if (isset($user['status']) && $user['status'] !== 'active') {
            $response->error('Your account is not active. Please contact support.', 403);
        }

        unset($user['password_hash']);
        
        $tokenData = $this->users->createToken((int) $user['id']);

        $response->success([
            'user' => $user,
            'token' => $tokenData['token'],
            'secret_key' => $tokenData['secret_key'],
            'expires_in' => $tokenData['expires_in']
        ]);
    }

     public function logout(Request $request, Response $response)
{
    // Get user_id from request body
    $userId = (int) $request->input('user_id', 0);
    
    // Validate user_id
    if ($userId <= 0) {
        $response->error('User ID is required for logout.', 400);
        return;
    }

    // Check if user exists in database
    $user = $this->users->findById($userId);
    
    if ($user === null) {
        error_log("Logout attempt failed: User not found with ID: $userId");
        $response->error('User not found.', 404);
        return;
    }
    error_log("User logged out: ID: $userId, Email: " . ($user['email'] ?? 'unknown'));
    $deleted = $this->users->deleteUserTokens($userId);
    
    if ($deleted) {
        $response->success([
            'message' => 'Logged out successfully',
            'user_id' => $userId
        ]);
    } else {
        // Even if deletion fails, return success (tokens might already be expired)
        error_log("Warning: Failed to delete tokens for user ID: $userId, but logout successful");
        $response->success([
            'message' => 'Logged out successfully',
            'user_id' => $userId
        ]);
    }
}

    public function me(array $user, Response $response): never
    {
        $response->success(['user' => $user]);
    }
}
