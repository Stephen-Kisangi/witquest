<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Start output buffering immediately
ob_start();

// Define response handler before any other logic
function json_response(array $data, int $status = 200): never {
    // Clean all output buffers
    while (ob_get_level() > 0) ob_end_clean();
    
    // Set security headers
    header('Content-Type: application/json');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    
    http_response_code($status);
    echo json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    exit;
}

// Configure secure session
session_start([
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true
]);

// Register error handlers
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        json_response([
            'success' => false,
            'message' => 'Critical system error',
            'redirect' => '',
            'attempts_remaining' => null
        ], 500);
    }
});

// Load dependencies
require_once $_SERVER['DOCUMENT_ROOT'] . '/witquest-school-website/admission/includes/db_connect.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/witquest-school-website/admission/includes/functions.php';

class LoginException extends RuntimeException {
    public int $attemptsRemaining;
    public function __construct(string $message, int $code, int $attemptsRemaining) {
        parent::__construct($message, $code);
        $this->attemptsRemaining = $attemptsRemaining;
    }
}

try {
    // Validate request structure
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

    // Validate credentials
    $loginId = isset($input['loginId']) ? trim((string)$input['loginId']) : '';
    $password = isset($input['password']) ? (string)$input['password'] : '';
    $rememberDevice = (bool)($input['rememberDevice'] ?? false);

    // Credential validation
    $emailValid = filter_var($loginId, FILTER_VALIDATE_EMAIL);
    $phoneValid = preg_match('/^07\d{8}$/', $loginId);
    
    if (!$emailValid && !$phoneValid) {
        throw new RuntimeException('Please enter a valid email or phone number (07xxxxxxxx)', 400);
    }

    if (strlen($password) < 8) {
        throw new RuntimeException('Password must be at least 8 characters', 400);
    }

    // Database operations
    $field = $emailValid ? 'email' : 'phone';
    $normalizedLogin = $field === 'phone' 
        ? preg_replace('/\D/', '', $loginId) 
        : strtolower($loginId);

    $stmt = $conn->prepare(
        "SELECT user_id, full_name, email, phone, password_hash, 
                role, is_locked, failed_attempts, last_login
         FROM users 
         WHERE $field = :login_id"
    );
    $stmt->bindValue(':login_id', $normalizedLogin, PDO::PARAM_STR);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        logFailedAttempt($normalizedLogin, 'User not found');
        throw new RuntimeException('Invalid credentials', 401);
    }

    if ($user['is_locked']) {
        logFailedAttempt($normalizedLogin, 'Account locked');
        throw new RuntimeException('Account locked. Please reset password.', 403);
    }

    if (!password_verify($password, $user['password_hash'])) {
        handleFailedAttempt($user);
        $remainingAttempts = max(0, 4 - (int)$user['failed_attempts']);
        
        throw new LoginException(
            $remainingAttempts > 0 
                ? "Invalid password. {$remainingAttempts} attempts remaining."
                : 'Account locked. Please reset password.',
            401,
            $remainingAttempts
        );
    }

    handleSuccessfulLogin($user, $normalizedLogin, $rememberDevice);
    
    json_response([
        'success' => true,
        'message' => '🎉 Login successful! Redirecting...',
        'redirect' => 'admission/payment.php',
        'attempts_remaining' => null
    ]);

} catch (LoginException $e) {
    json_response([
        'success' => false,
        'message' => $e->getMessage(),
        'redirect' => '',
        'attempts_remaining' => $e->attemptsRemaining
    ], $e->getCode());
} catch (RuntimeException $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 400;
    json_response([
        'success' => false,
        'message' => $e->getMessage(),
        'redirect' => '',
        'attempts_remaining' => null
    ], $code);
} catch (Throwable $e) {
    error_log("System Error: {$e->getMessage()} in {$e->getFile()}:{$e->getLine()}");
    json_response([
        'success' => false,
        'message' => 'A system error occurred',
        'redirect' => '',
        'attempts_remaining' => null
    ], 500);
}

function handleFailedAttempt(array $user): void {
    global $conn;
    
    $conn->beginTransaction();
    try {
        $failedAttempts = (int)$user['failed_attempts'] + 1;
        $isLocked = $failedAttempts >= 5;

        $stmt = $conn->prepare(
            "UPDATE users 
             SET failed_attempts = :attempts, 
                 is_locked = :locked,
                 updated_at = NOW()
             WHERE user_id = :id"
        );
        
        $stmt->execute([
            ':attempts' => $failedAttempts,
            ':locked' => $isLocked,
            ':id' => $user['user_id']
        ]);
        
        logFailedAttempt(
            $user['email'] ?? $user['phone'],
            $isLocked ? 'Account locked' : 'Invalid password'
        );
        
        $conn->commit();
    } catch (Throwable $e) {
        $conn->rollBack();
        throw $e;
    }
}

function handleSuccessfulLogin(array $user, string $loginId, bool $rememberDevice): void {
    global $conn;
    
    session_regenerate_id(true);
    
    $_SESSION = [
        'user_id' => $user['user_id'],
        'user_name' => $user['full_name'],
        'user_email' => $user['email'],
        'user_role' => $user['role'],
        'auth_time' => time(),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)
    ];

    $conn->prepare(
        "UPDATE users 
         SET failed_attempts = 0,
             last_login = NOW(),
             updated_at = NOW()
         WHERE user_id = :id"
    )->execute([':id' => $user['user_id']]);

    if ($rememberDevice) {
        createRememberMeToken((int)$user['user_id']);
    }

    logSuccessfulLogin((int)$user['user_id'], $loginId);
}

function createRememberMeToken(int $userId): void {
    global $conn;
    
    $selector = bin2hex(random_bytes(12));
    $validator = bin2hex(random_bytes(32));
    $hashedValidator = hash('sha256', $validator);
    $expiry = time() + 2592000;

    $conn->prepare(
        "INSERT INTO auth_tokens 
         (selector, user_id, hashed_validator, expiry)
         VALUES (:selector, :id, :validator, :expiry)"
    )->execute([
        ':selector' => $selector,
        ':id' => $userId,
        ':validator' => $hashedValidator,
        ':expiry' => date('Y-m-d H:i:s', $expiry)
    ]);

    setcookie('remember_me', "{$selector}:{$validator}", [
        'expires' => $expiry,
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);
}