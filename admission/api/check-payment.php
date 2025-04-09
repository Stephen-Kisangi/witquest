<?php
session_start();
header('Content-Type: application/json');
require_once 'db_config.php';

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'parent') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$code = $_GET['code'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT * FROM payments 
                          WHERE (transaction_code = ? OR mpesa_code = ?)
                          AND phone = ?
                          LIMIT 1");
    $stmt->execute([$code, $code, $_SESSION['user_phone']]);
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$payment) {
        http_response_code(404);
        echo json_encode(['error' => 'Payment not found']);
        exit;
    }

    echo json_encode([
        'status' => $payment['status'],
        'amount' => $payment['amount'],
        'date' => $payment['payment_date'],
        'downloadUrl' => '/downloads/admission-form.pdf'
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>