<?php
/**
 * Secure Database Connection Script
 * Version 2.2 - Simplified Connection
 */

// Database configuration
$host = 'localhost';
$dbname = 'school_admissions';
$username = 'school_portal_user';
$password = 'SteveWitquestCastleSchool2025!.';
$charset = 'utf8mb4';

// DSN (Data Source Name)
$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

// PDO options
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET time_zone = '+00:00'"
];

// Establish connection
try {
    $conn = new PDO($dsn, $username, $password, $options);
    
    // Verify connection
    $conn->query("SELECT 1");
    
} catch (PDOException $e) {
    // Secure logging without sending a response
    error_log(date('[Y-m-d H:i:s]') . " DB Connection Error: " . $e->getMessage() . PHP_EOL, 3, __DIR__ . '/../logs/db_errors.log');
    
    // Throw an exception to be caught by the calling script
    throw new RuntimeException('Database connection failed', 500);
}