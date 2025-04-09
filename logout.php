<?php
// Start the session
session_start();

// Check if this is an AJAX request
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    // If not logged in and it's an AJAX request, return JSON
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'You are not currently logged in.',
            'type' => 'warning',
            'redirect' => false
        ]);
        exit();
    } else {
        // Regular request, redirect as before
        header("Location: login.php?error=not_logged_in");
        exit();
    }
}

// Store user information before destroying the session
$logged_out_user_id = $_SESSION['user_id'];

try {
    // Unset all session variables
    $_SESSION = array();
    
    // Destroy the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Destroy the session
    session_destroy();
    
    // Clear any remember me cookies if you have them
    if (isset($_COOKIE['remember_me'])) {
        setcookie('remember_me', '', time() - 3600, '/');
    }
    
    // Log successful logout event
    error_log("User logged out successfully: " . $logged_out_user_id . " at " . date('Y-m-d H:i:s'));
    
    // If AJAX request, return JSON
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => '✔ You have been successfully logged out.',
            'type' => 'success',
            'redirect' => true,
            'redirectUrl' => '../login.php'
        ]);
        exit();
    } else {
        // Regular request, redirect as before
        header("Location: ../login.php?logout=success");
        exit();
    }
} catch (Exception $e) {
    // Log any errors during logout process
    error_log("Logout error for user " . $logged_out_user_id . ": " . $e->getMessage());
    
    // If AJAX request, return JSON
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'There was an issue logging out. Please try again.',
            'type' => 'danger',
            'redirect' => false
        ]);
        exit();
    } else {
        // Regular request, redirect with an error message
        header("Location: login.php?error=logout_failed");
        exit();
    }
}
?>