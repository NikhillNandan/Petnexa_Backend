<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'db.php';

// Get POST data
$booking_id = isset($_POST['booking_id']) ? intval($_POST['booking_id']) : 0;
$extra_charges = isset($_POST['extra_charges']) ? floatval($_POST['extra_charges']) : 0;
$spa_id = isset($_POST['spa_id']) ? intval($_POST['spa_id']) : 0;
$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

if ($booking_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid booking ID'
    ]);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Resolve user_id to spa_id if provided as user_id
    if ($user_id > 0 && $spa_id <= 0) {
        $stmt_sp = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
        $stmt_sp->execute([$user_id]);
        $row_sp = $stmt_sp->fetch(PDO::FETCH_ASSOC);
        if ($row_sp) {
            $spa_id = intval($row_sp['spa_id']);
        }
    }

    // Ensure columns exist in spa_bookings
    try {
        $conn->exec("ALTER TABLE spa_bookings ADD COLUMN extra_charges DECIMAL(10,2) DEFAULT 0.00");
    } catch (PDOException $e) {}
    try {
        $conn->exec("ALTER TABLE spa_bookings ADD COLUMN extra_payment_status VARCHAR(20) DEFAULT 'PENDING'");
    } catch (PDOException $e) {}

    // Update extra charges
    $stmt = $conn->prepare("
        UPDATE spa_bookings 
        SET extra_charges = ?, extra_payment_status = 'PENDING'
        WHERE booking_id = ?
    ");

    $stmt->execute([$extra_charges, $booking_id]);

    // Fetch new total
    $stmtTotal = $conn->prepare("SELECT service_fee, extra_charges FROM spa_bookings WHERE booking_id = ?");
    $stmtTotal->execute([$booking_id]);
    $rowTotal = $stmtTotal->fetch(PDO::FETCH_ASSOC);
    $new_total = floatval($rowTotal['service_fee']) + floatval($rowTotal['extra_charges']);

    echo json_encode([
        'success' => true,
        'message' => 'Charges updated successfully',
        'extra_charges' => $extra_charges,
        'total_amount' => $new_total
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
