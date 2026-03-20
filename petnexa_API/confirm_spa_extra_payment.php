<?php
header('Content-Type: application/json');
require_once 'db.php';

$booking_id = isset($_POST['booking_id']) ? intval($_POST['booking_id']) : 0;
if ($booking_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid booking ID']);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Make sure column exists
    try {
        $conn->exec("ALTER TABLE spa_bookings ADD COLUMN extra_payment_status VARCHAR(20) DEFAULT 'PENDING'");
    } catch (PDOException $e) { /* Already exists */ }

    $stmt = $conn->prepare("UPDATE spa_bookings SET extra_payment_status = 'CONFIRMED' WHERE booking_id = ?");
    $stmt->execute([$booking_id]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
