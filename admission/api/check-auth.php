<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Define response handler
function json_response(array $data, int $status = 200): void {
    header('Content-Type: application/json');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    
    http_response_code($status);
    echo json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
}

// Configure secure session
session_start([
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true
]);

// Initialize response
$response = [
    'authenticated' => false,
    'role' => null
];

// Check if user is already logged in via session
if (isset($_SESSION['user_id']) && isset($_SESSION['user_role'])) {
    $response['authenticated'] = true;
    $response['role'] = $_SESSION['user_role'];
} 
// Auto-login functionality using remember_me cookie
else if (isset($_COOKIE['remember_me'])) {
    try {
        // Include database connection
        require_once $_SERVER['DOCUMENT_ROOT'] . '/witquest-school-website/admission/includes/db_connect.php';
        
        // Parse the remember_me cookie
        $cookieParts = explode(':', $_COOKIE['remember_me']);
        
        if (count($cookieParts) !== 2) {
            // Invalid cookie format, clear it
            setcookie('remember_me', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            throw new Exception('Invalid remember_me cookie format');
        }
        
        [$selector, $validator] = $cookieParts;
        
        // Find the token in the database
        $stmt = $conn->prepare(
            "SELECT at.user_id, at.hashed_validator, at.expiry, 
                    u.full_name, u.email, u.role, u.is_locked
             FROM auth_tokens at
             JOIN users u ON at.user_id = u.user_id
             WHERE at.selector = :selector
             AND at.expiry > NOW()"
        );
        
        $stmt->execute([':selector' => $selector]);
        $token = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$token) {
            // Token not found or expired, clear cookie
            setcookie('remember_me', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            throw new Exception('Remember me token not found or expired');
        }
        
        // Verify if the account is locked
        if ($token['is_locked']) {
            // Remove token and clear cookie for locked accounts
            $conn->prepare("DELETE FROM auth_tokens WHERE selector = :selector")
                 ->execute([':selector' => $selector]);
                 
            setcookie('remember_me', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            throw new Exception('Account is locked');
        }
        
        // Verify the validator
        $hashedValidator = hash('sha256', $validator);
        
        if (!hash_equals($token['hashed_validator'], $hashedValidator)) {
            throw new Exception('Invalid token validator');
        }
        
        // Token is valid, regenerate session ID for security
        session_regenerate_id(true);
        
        // Set session variables (similar to your login function)
        $_SESSION['user_id'] = $token['user_id'];
        $_SESSION['user_name'] = $token['full_name'];
        $_SESSION['user_email'] = $token['email'];
        $_SESSION['user_role'] = $token['role'];
        $_SESSION['auth_time'] = time();
        $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'];
        $_SESSION['user_agent'] = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
        
        // Update response
        $response['authenticated'] = true;
        $response['role'] = $token['role'];
        
        // Update last_used timestamp for the token
        $conn->prepare(
            "UPDATE auth_tokens 
             SET last_used = NOW() 
             WHERE selector = :selector"
        )->execute([':selector' => $selector]);
        
        // Update user's last_login time
        $conn->prepare(
            "UPDATE users 
             SET last_login = NOW() 
             WHERE user_id = :id"
        )->execute([':id' => $token['user_id']]);
        
        // Optionally rotate the token for better security
        $newSelector = bin2hex(random_bytes(12));
        $newValidator = bin2hex(random_bytes(32));
        $newHashedValidator = hash('sha256', $newValidator);
        $expiry = time() + 2592000; // 30 days
        
        // Update token in database
        $conn->prepare(
            "UPDATE auth_tokens 
             SET selector = :new_selector,
                 hashed_validator = :new_validator,
                 expiry = :expiry,
                 last_used = NOW()
             WHERE selector = :old_selector"
        )->execute([
            ':new_selector' => $newSelector,
            ':new_validator' => $newHashedValidator,
            ':expiry' => date('Y-m-d H:i:s', $expiry),
            ':old_selector' => $selector
        ]);
        
        // Set new cookie
        setcookie('remember_me', "{$newSelector}:{$newValidator}", [
            'expires' => $expiry,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
        
    } catch (Exception $e) {
        // Log the error but don't expose details in response
        error_log('Auto-login failed: ' . $e->getMessage());
    }
}

// Send JSON response
json_response($response);
?>