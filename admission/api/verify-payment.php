<?php
session_start();
header('Content-Type: application/json');
require_once 'db_config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$paymentData = json_decode(file_get_contents('php://input'), true);

try {
    $stmt = $pdo->prepare("UPDATE payments SET 
                          status = 'verified',
                          verified_by = ?,
                          verification_date = NOW()
                          WHERE id = ?");
    $stmt->execute([$_SESSION['user_id'], $paymentData['payment_id']]);

    echo json_encode(['success' => true, 'message' => 'Payment verified successfully']);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>