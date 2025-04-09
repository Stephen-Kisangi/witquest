<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Load dependencies
require_once 'admission/includes/db_connect.php';
require_once 'admission/includes/functions.php';

// Response handler function (similar to login script)
function json_response(array $data, int $status = 200): never {
    while (ob_get_level() > 0) ob_end_clean();
    
    header('Content-Type: application/json');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    
    http_response_code($status);
    echo json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    exit;
}

// Notification sender (placeholder - customize for your system)
function sendPasswordResetEmail(array $user, string $resetToken): bool {
    $resetLink = "https://" . $_SERVER['HTTP_HOST'] . "/reset-password.php?token={$resetToken}";
    
    $to = $user['email'];
    $subject = 'Password Reset Request';
    $message = "Hello {$user['full_name']},\n\n" .
               "Click the following link to reset your password:\n" .
               "{$resetLink}\n\n" .
               "This link will expire in 1 hour.\n" .
               "If you did not request a password reset, please ignore this email.";
    
    $headers = 'From: noreply@' . $_SERVER['HTTP_HOST'];
    
    return mail($to, $subject, $message, $headers);
}

// Initiate password reset request
function initiatePasswordReset(PDO $conn, string $loginId): void {
    // Validate input
    $emailValid = filter_var($loginId, FILTER_VALIDATE_EMAIL);
    $phoneValid = preg_match('/^07\d{8}$/', $loginId);
    
    if (!$emailValid && !$phoneValid) {
        throw new RuntimeException('Please enter a valid email or phone number (07xxxxxxxx)', 400);
    }

    // Determine login field
    $field = $emailValid ? 'email' : 'phone';
    $normalizedLogin = $field === 'phone' 
        ? preg_replace('/\D/', '', $loginId) 
        : strtolower($loginId);

    // Find user
    $stmt = $conn->prepare(
        "SELECT user_id, full_name, email, is_locked, failed_attempts 
         FROM users 
         WHERE $field = :login_id"
    );
    $stmt->bindValue(':login_id', $normalizedLogin, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // User not found
    if (!$user) {
        throw new RuntimeException('No account found with this email or phone number', 404);
    }

    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Store reset token
    $stmt = $conn->prepare(
        "INSERT INTO password_reset_tokens 
         (user_id, reset_token, token_expiry) 
         VALUES (:user_id, :token, :expiry)
         ON DUPLICATE KEY UPDATE 
         reset_token = :token, 
         token_expiry = :expiry"
    );
    $stmt->execute([
        ':user_id' => $user['user_id'],
        ':token' => hash('sha256', $resetToken),
        ':expiry' => $tokenExpiry
    ]);

    // Send reset email
    if (!sendPasswordResetEmail($user, $resetToken)) {
        throw new RuntimeException('Failed to send reset email', 500);
    }
}

// Verify reset token and reset password
function resetPassword(PDO $conn, string $token, string $newPassword): void {
    // Validate new password
    if (strlen($newPassword) < 8) {
        throw new RuntimeException('Password must be at least 8 characters', 400);
    }

    // Find valid reset token
    $stmt = $conn->prepare(
        "SELECT user_id, token_expiry 
         FROM password_reset_tokens 
         WHERE reset_token = :token AND token_expiry > NOW()"
    );
    $stmt->bindValue(':token', hash('sha256', $token), PDO::PARAM_STR);
    $stmt->execute();
    $tokenInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tokenInfo) {
        throw new RuntimeException('Invalid or expired reset token', 400);
    }

    // Hash new password
    $newPasswordHash = password_hash($newPassword, PASSWORD_ARGON2ID, [
        'memory_cost' => 65536,
        'time_cost' => 4,
        'threads' => 3
    ]);

    // Begin transaction
    $conn->beginTransaction();
    try {
        // Update user password
        $stmt = $conn->prepare(
            "UPDATE users 
             SET password_hash = :new_hash, 
                 is_locked = 0, 
                 failed_attempts = 0, 
                 updated_at = NOW() 
             WHERE user_id = :user_id"
        );
        $stmt->execute([
            ':new_hash' => $newPasswordHash,
            ':user_id' => $tokenInfo['user_id']
        ]);

        // Remove used reset token
        $stmt = $conn->prepare(
            "DELETE FROM password_reset_tokens 
             WHERE user_id = :user_id"
        );
        $stmt->execute([':user_id' => $tokenInfo['user_id']]);

        $conn->commit();
    } catch (Throwable $e) {
        $conn->rollBack();
        throw $e;
    }
}

// Main request handler
try {
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new RuntimeException('Invalid request method', 405);
    }

    // Check content type
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') === false) {
        throw new RuntimeException('Invalid content type', 400);
    }

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new RuntimeException('Invalid JSON format', 400);
    }

    // Determine action based on input
    if (isset($input['loginId'])) {
        // Initiate password reset request
        initiatePasswordReset($conn, $input['loginId']);
        json_response([
            'success' => true,
            'message' => 'Password reset instructions sent to your email/phone'
        ]);
    } elseif (isset($input['token']) && isset($input['newPassword'])) {
        // Complete password reset
        resetPassword($conn, $input['token'], $input['newPassword']);
        json_response([
            'success' => true,
            'message' => 'Password successfully reset. Please log in.'
        ]);
    } else {
        throw new RuntimeException('Invalid request parameters', 400);
    }

} catch (RuntimeException $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 400;
    json_response([
        'success' => false,
        'message' => $e->getMessage()
    ], $code);
} catch (Throwable $e) {
    error_log("Password Reset Error: {$e->getMessage()} in {$e->getFile()}:{$e->getLine()}");
    json_response([
        'success' => false,
        'message' => 'A system error occurred during password reset'
    ], 500);
}