<?php
session_start();
header('Content-Type: application/json');
require_once 'db_config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

try {
    $stmt = $pdo->query("SELECT * FROM payments WHERE status = 'pending'");
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['payments' => $payments]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>