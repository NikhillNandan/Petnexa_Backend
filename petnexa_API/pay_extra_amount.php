<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');

require_once 'db.php';

$appointment_id = isset($_POST['appointment_id']) ? intval($_POST['appointment_id']) : 0;
$payment_method = isset($_POST['payment_method']) ? $_POST['payment_method'] : '';

if ($appointment_id <= 0 || !in_array($payment_method, ['CASH', 'UPI'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid parameters']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $status = $payment_method === 'CASH' ? 'PAID_CASH' : 'PAID_UPI';

    $stmt = $conn->prepare("UPDATE doctor_appointments SET extra_payment_status = ? WHERE appointment_id = ?");
    $stmt->execute([$status, $appointment_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
