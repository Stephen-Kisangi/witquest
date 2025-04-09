<?php
session_start();
header('Content-Type: application/json');
require_once 'db_config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'parent') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT status, amount, payment_date 
                          FROM payments 
                          WHERE user_id = ?
                          ORDER BY payment_date DESC 
                          LIMIT 1");
    $stmt->execute([$_SESSION['user_id']]);
    $paymentStatus = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['paymentStatus' => $paymentStatus ?: ['status' => 'unpaid']]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>