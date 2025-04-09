<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

session_start();

// Security headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");

// Database configuration
const DB_CONFIG = [
    'servername' => 'localhost',
    'username' => 'school_portal_user',
    'password' => 'SteveWitquestCastleSchool2025!.',
    'dbname' => 'school_admissions'
];

// Initialize variables
$errors = [];
$old_input = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $errors[] = [
            'text' => "Security verification failed. Please try again.",
            'duration' => 5000
        ];
    }

    // Sanitize and validate inputs
    $inputs = [
        'fullName' => trim($_POST['fullName'] ?? ''),
        'phone' => trim($_POST['phone'] ?? ''),
        'email' => trim($_POST['email'] ?? ''),
        'password' => $_POST['password'] ?? ''
    ];

    // Validation rules
    $validation = [
        'fullName' => [
            'pattern' => '/^[A-Za-z]{2,}(?:\s[A-Za-z]{2,})+$/',
            'message' => 'Valid full name required (minimum two names)'
        ],
        'phone' => [
            'pattern' => '/^07\d{8}$/',
            'message' => 'Invalid phone format (07XXXXXXXX)'
        ],
        'email' => [
            'filter' => FILTER_VALIDATE_EMAIL,
            'message' => 'Invalid email address'
        ],
        'password' => [
            'pattern' => '/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'message' => 'Password must contain 8+ chars with uppercase, lowercase, number, and special character'
        ]
    ];

    foreach ($validation as $field => $rule) {
        if ($field === 'email') {
            if (!filter_var($inputs[$field], $rule['filter'])) {
                $errors[$field] = [
                    'text' => $rule['message'],
                    'duration' => 5000
                ];
            }
        } elseif (!preg_match($rule['pattern'], $inputs[$field])) {
            $errors[$field] = [
                'text' => $rule['message'],
                'duration' => 5000
            ];
        }
    }

    if (empty($errors)) {
        try {
            $conn = new mysqli(
                DB_CONFIG['servername'],
                DB_CONFIG['username'],
                DB_CONFIG['password'],
                DB_CONFIG['dbname']
            );

            if ($conn->connect_error) {
                throw new Exception("Database connection failed: " . $conn->connect_error);
            }

            // Check for existing users
            $stmt = $conn->prepare("SELECT email, phone FROM users WHERE email = ? OR phone = ?");
            $stmt->bind_param("ss", $inputs['email'], $inputs['phone']);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    if ($row['email'] === $inputs['email']) {
                        $errors['email'] = [
                            'text' => "Email already registered",
                            'duration' => 5000
                        ];
                    }
                    if ($row['phone'] === $inputs['phone']) {
                        $errors['phone'] = [
                            'text' => "Phone already registered",
                            'duration' => 5000
                        ];
                    }
                }
            }
            $stmt->close();

            if (empty($errors)) {
                $hash = password_hash($inputs['password'], PASSWORD_ARGON2ID);
                $stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'parent')");
                $stmt->bind_param("ssss", $inputs['fullName'], $inputs['email'], $inputs['phone'], $hash);

                if ($stmt->execute()) {
                    $_SESSION['success_message'] = [
                        'text' => "🎉 Registration successful! Redirecting to login...",
                        'duration' => 3000
                    ];
                    header("Location: register.php");
                    exit();
                }
                $stmt->close();
            }
            $conn->close();
        } catch (Exception $e) {
            error_log("Database error: " . $e->getMessage());
            $errors[] = [
                'text' => "A system error occurred. Please try again later.",
                'duration' => 5000
            ];
        }
    }

    // Store errors and input for redisplay
    $_SESSION['errors'] = $errors;
    $_SESSION['old_input'] = $inputs;
    header("Location: register.php");
    exit();
}

// Generate CSRF token if not exists
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}