<?php
/**
 * Functions Library for School Admissions System
 * 
 * Contains utility functions for login, security, and system operations
 * Version 2.0 - Enhanced Security and Error Handling
 */

/**
 * Log a successful login attempt
 * 
 * @param int $userId User ID
 * @param string $loginId Email or phone used for login
 * @return bool Success status
 */
function logSuccessfulLogin($userId, $loginId) {
    global $conn;
    
    try {
        // Validate inputs
        if (!$conn) {
            error_log("Database connection lost during successful login logging");
            return false;
        }

        $stmt = $conn->prepare("INSERT INTO security_logs 
                              (user_id, event_type, ip_address, user_agent, description)
                              VALUES (:user_id, 'login_success', INET6_ATON(:ip), :user_agent, :description)");
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 500);
        $description = "Successful login using " . (filter_var($loginId, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone');
        
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
        $stmt->bindValue(':user_agent', $userAgent, PDO::PARAM_STR);
        $stmt->bindValue(':description', $description, PDO::PARAM_STR);
        
        $result = $stmt->execute();
        
        if (!$result) {
            error_log("Failed to log successful login. Error info: " . print_r($stmt->errorInfo(), true));
        }
        
        return $result;
    } catch (PDOException $e) {
        error_log("PDO Error in logSuccessfulLogin: " . $e->getMessage());
        error_log("SQL State: " . $e->getSQLState());
        error_log("Error Details: " . print_r($e->errorInfo, true));
        return false;
    } catch (Throwable $e) {
        error_log("Unexpected error in logSuccessfulLogin: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());
        return false;
    }
}

/**
 * Log a failed login attempt
 * 
 * @param string $loginId Email or phone attempted
 * @param string $reason Reason for failure
 * @return bool Success status
 */
function logFailedAttempt($loginId, $reason) {
    global $conn;
    
    try {
        // Validate inputs
        if (!$conn) {
            error_log("Database connection lost during failed login logging");
            return false;
        }

        $stmt = $conn->prepare("INSERT INTO security_logs 
                              (user_id, event_type, ip_address, user_agent, description)
                              VALUES (NULL, 'login_failure', INET6_ATON(:ip), :user_agent, :description)");
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 500);
        $description = "Failed login attempt for '$loginId'. Reason: $reason";
        
        $stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
        $stmt->bindValue(':user_agent', $userAgent, PDO::PARAM_STR);
        $stmt->bindValue(':description', $description, PDO::PARAM_STR);
        
        $result = $stmt->execute();
        
        if (!$result) {
            error_log("Failed to log failed login attempt. Error info: " . print_r($stmt->errorInfo(), true));
        }
        
        return $result;
    } catch (PDOException $e) {
        error_log("PDO Error in logFailedAttempt: " . $e->getMessage());
        error_log("SQL State: " . $e->getSQLState());
        error_log("Error Details: " . print_r($e->errorInfo, true));
        return false;
    } catch (Throwable $e) {
        error_log("Unexpected error in logFailedAttempt: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());
        return false;
    }
}

/**
 * Log system errors with enhanced tracking
 * 
 * @param string $errorMessage Error message to log
 * @param array $context Additional context information
 * @return bool Success status
 */
function logSystemError($errorMessage, array $context = []) {
    global $conn;
    
    try {
        if (!$conn) {
            // Fallback to error_log if database connection is lost
            error_log("SYSTEM ERROR (DB Conn Lost): $errorMessage");
            error_log("Context: " . json_encode($context));
            return false;
        }

        $stmt = $conn->prepare("INSERT INTO security_logs 
                              (event_type, ip_address, user_agent, description)
                              VALUES ('login_failure', INET6_ATON(:ip), :user_agent, :description)");
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 500);
        
        // Include context in description if available
        $description = $errorMessage;
        if (!empty($context)) {
            $description .= " | Context: " . json_encode($context);
        }
        
        $stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
        $stmt->bindValue(':user_agent', $userAgent, PDO::PARAM_STR);
        $stmt->bindValue(':description', $description, PDO::PARAM_STR);
        
        $result = $stmt->execute();
        
        if (!$result) {
            error_log("Failed to log system error. Error info: " . print_r($stmt->errorInfo(), true));
        }
        
        return $result;
    } catch (PDOException $e) {
        error_log("PDO Error in logSystemError: " . $e->getMessage());
        error_log("Error Details: " . print_r($e->errorInfo, true));
        return false;
    } catch (Throwable $e) {
        error_log("Unexpected error in logSystemError: " . $e->getMessage());
        error_log("Trace: " . $e->getTraceAsString());
        return false;
    }
}

/**
 * Generate a cryptographically secure random token
 * 
 * @param int $length Desired token length (must be even)
 * @return string Random token
 */
function generateToken($length = 32) {
    // Ensure length is even
    $length = max(16, $length);
    $length = $length % 2 === 0 ? $length : $length + 1;
    
    try {
        return bin2hex(random_bytes($length / 2));
    } catch (Exception $e) {
        // Fallback method if random_bytes fails
        error_log("Token generation failed: " . $e->getMessage());
        return hash('sha256', uniqid(mt_rand(), true));
    }
}

/**
 * Check if a user session is valid
 * 
 * @return bool True if session is valid
 */
function isValidSession() {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        return false;
    }
    
    // Check session timeout (configurable, default 30 minutes)
    $timeout = getConfig('session_timeout', 1800); // 30 minutes
    
    if (isset($_SESSION['last_activity']) && 
        (time() - $_SESSION['last_activity'] > $timeout)) {
        // Session has expired
        session_unset();
        session_destroy();
        return false;
    }
    
    // Update last activity time
    $_SESSION['last_activity'] = time();
    return true;
}

/**
 * Get user data by ID with enhanced error handling
 * 
 * @param int $userId User ID
 * @return array|false User data or false if not found
 */
function getUserById($userId) {
    global $conn;
    
    try {
        $stmt = $conn->prepare("SELECT 
            user_id, full_name, email, phone, role, 
            created_at, last_login, is_locked 
            FROM users 
            WHERE user_id = :user_id");
        
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user ?: false;
    } catch (PDOException $e) {
        error_log("Error fetching user: " . $e->getMessage());
        error_log("SQL Error Details: " . print_r($e->errorInfo, true));
        return false;
    }
}

/**
 * Sanitize and validate input
 * 
 * @param string $input Input to sanitize
 * @param string $type Type of input (email, phone, etc.)
 * @return string|false Sanitized input or false if invalid
 */
function validateInput($input, $type = 'string') {
    $input = trim($input);
    
    switch ($type) {
        case 'email':
            $input = filter_var($input, FILTER_SANITIZE_EMAIL);
            return filter_var($input, FILTER_VALIDATE_EMAIL) ? $input : false;
        
        case 'phone':
            // Kenyan phone number validation (07xxxxxxxx or +254xxxxxxxx)
            $input = preg_replace('/\D/', '', $input);
            return preg_match('/^(07\d{8}|254\d{9})$/', $input) ? $input : false;
        
        case 'string':
        default:
            // Remove potentially dangerous characters
            return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
}

/**
 * Check if a user has admin role
 * 
 * @return bool True if user is admin
 */
function isAdmin() {
    return isset($_SESSION['user_role']) && 
           $_SESSION['user_role'] === 'admin';
}

/**
 * Get system configuration with caching
 * 
 * @param string $key Configuration key
 * @param mixed $default Default value if not found
 * @return mixed Configuration value
 */
function getConfig($key, $default = null) {
    global $conn;
    
    // Simple static cache
    static $configCache = [];
    
    if (isset($configCache[$key])) {
        return $configCache[$key];
    }
    
    try {
        $stmt = $conn->prepare("SELECT config_value FROM system_config WHERE config_key = :key");
        $stmt->bindValue(':key', $key, PDO::PARAM_STR);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $value = $result ? $result['config_value'] : $default;
        
        // Cache the result
        $configCache[$key] = $value;
        
        return $value;
    } catch (PDOException $e) {
        error_log("Error fetching config '$key': " . $e->getMessage());
        return $default;
    }
}

/**
 * Log user activity with comprehensive tracking
 * 
 * @param string $eventType Type of event
 * @param string $description Additional details
 * @return bool Success status
 */
function logActivity($eventType, $description = '') {
    global $conn;
    
    // Predefined valid event types
    $validEventTypes = [
        'login_success', 'login_failure', 'payment_verified', 
        'payment_rejected', 'account_locked', 'form_downloaded'
    ];
    
    // Validate event type
    if (!in_array($eventType, $validEventTypes)) {
        error_log("Invalid activity event type: $eventType");
        return false;
    }
    
    try {
        $userId = $_SESSION['user_id'] ?? null;
        
        $stmt = $conn->prepare("INSERT INTO security_logs 
                              (user_id, event_type, ip_address, user_agent, description)
                              VALUES (:user_id, :event_type, INET6_ATON(:ip), :user_agent, :description)");
        
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'unknown', 0, 500);
        
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':event_type', $eventType, PDO::PARAM_STR);
        $stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
        $stmt->bindValue(':user_agent', $userAgent, PDO::PARAM_STR);
        $stmt->bindValue(':description', $description, PDO::PARAM_STR);
        
        return $stmt->execute();
    } catch (PDOException $e) {
        error_log("Error logging activity: " . $e->getMessage());
        error_log("SQL Error Details: " . print_r($e->errorInfo, true));
        return false;
    }
}