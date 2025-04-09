<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Start secure session
session_start([
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true
]);

// If the session is already active, do nothing
if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_me'])) {
    try {
        require_once $_SERVER['DOCUMENT_ROOT'] . '/witquest-school-website/admission/includes/db_connect.php';
        
        // Parse the cookie
        $cookieParts = explode(':', $_COOKIE['remember_me']);
        if (count($cookieParts) !== 2) {
            setcookie('remember_me', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            throw new Exception('Invalid cookie format');
        }
        
        [$selector, $validator] = $cookieParts;
        
        // Query the token from the database
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
            setcookie('remember_me', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            throw new Exception('Token not found or expired');
        }
        
        if ($token['is_locked']) {
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
        
        $hashedValidator = hash('sha256', $validator);
        if (!hash_equals($token['hashed_validator'], $hashedValidator)) {
            throw new Exception('Invalid token validator');
        }
        
        // Regenerate session and set session variables
        session_regenerate_id(true);
        $_SESSION['user_id'] = $token['user_id'];
        $_SESSION['user_name'] = $token['full_name'];
        $_SESSION['user_email'] = $token['email'];
        $_SESSION['user_role'] = $token['role'];
        $_SESSION['auth_time'] = time();
        $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'];
        $_SESSION['user_agent'] = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
        
        // Update token usage details (and optionally rotate token)
        $conn->prepare(
            "UPDATE auth_tokens 
             SET last_used = NOW() 
             WHERE selector = :selector"
        )->execute([':selector' => $selector]);
        $conn->prepare(
            "UPDATE users 
             SET last_login = NOW() 
             WHERE user_id = :id"
        )->execute([':id' => $token['user_id']]);
        
        // Optionally, rotate token for improved security...
        // (Rotation code can be added here if desired.)
        
    } catch (Exception $e) {
        error_log('Auto-login failed: ' . $e->getMessage());
    }
}
// End auto_login.php without output
?>
