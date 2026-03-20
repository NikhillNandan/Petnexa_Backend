<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');

require_once 'db.php';

$appointment_id = isset($_POST['appointment_id']) ? intval($_POST['appointment_id']) : 0;
$amount = isset($_POST['amount']) ? floatval($_POST['amount']) : 0;

if ($appointment_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid appointment ID']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Make sure column exists
    try {
        $conn->exec("ALTER TABLE doctor_appointments ADD COLUMN extra_paid_amount DECIMAL(10,2) DEFAULT 0");
    } catch (PDOException $e) {
        // Ignored if column already exists
    }

    $stmt = $conn->prepare("UPDATE doctor_appointments SET extra_paid_amount = extra_paid_amount + ?, extra_payment_status = 'PENDING' WHERE appointment_id = ?");
    $stmt->execute([$amount, $appointment_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>