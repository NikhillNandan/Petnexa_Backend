<?php
// book_spa.php - Book a spa service
error_reporting(0);
ini_set('display_errors', 0);
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(array("status" => "error", "message" => "POST method required"));
    exit;
}

$user_id = isset($_POST['user_id']) ? (int) $_POST['user_id'] : (isset($_POST['buyer_id']) ? (int) $_POST['buyer_id'] : 0);
$service_id = isset($_POST['service_id']) ? (int) $_POST['service_id'] : 0;
$pet_id_raw = isset($_POST['pet_id']) ? $_POST['pet_id'] : '';
$pet_id = ($pet_id_raw !== '' && $pet_id_raw !== '-1' && (int) $pet_id_raw > 0) ? (int) $pet_id_raw : null;
$booking_date = isset($_POST['booking_date']) ? $_POST['booking_date'] : '';
$spa_owner_id = isset($_POST['spa_owner_id']) ? (int) $_POST['spa_owner_id'] : 0;
$pet_source = isset($_POST['pet_source']) ? $_POST['pet_source'] : 'purchased';
if ($pet_source == 'manual' || $pet_source == 'manually added')
    $pet_source = 'manual';
else if ($pet_source == 'none' || $pet_source == 'listing')
    $pet_source = 'purchased'; // 'listing' pets also reference the main pets table

// Validate required fields (pet_id is optional for spa bookings)
if ($user_id <= 0 || $service_id <= 0 || empty($booking_date)) {
    echo json_encode(array("status" => "error", "message" => "user_id, service_id, and booking_date are required"));
    exit;
}

// Check service exists and get details
$checkSvc = $conn->prepare("SELECT ss.service_id, ss.service_name, ss.price, ss.duration_minutes, ss.spa_id as spa_user_id, sp.spa_id, sp.spa_name 
                            FROM spa_services ss 
                            LEFT JOIN spa_profiles sp ON ss.spa_id = sp.user_id 
                            WHERE ss.service_id = ?");
$checkSvc->bind_param("i", $service_id);
$checkSvc->execute();
$svcResult = $checkSvc->get_result();

if ($svcResult->num_rows == 0) {
    echo json_encode(array("status" => "error", "message" => "Service not found"));
    exit;
}
$service = $svcResult->fetch_assoc();
$checkSvc->close();

// Resolve the correct spa_profiles.spa_id for the FK
// First try using the spa_owner_id passed from Android
$spa_profile_id = 0;
if ($spa_owner_id > 0) {
    $spLookup = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
    $spLookup->bind_param("i", $spa_owner_id);
    $spLookup->execute();
    $spResult = $spLookup->get_result();
    if ($spResult->num_rows > 0) {
        $spa_profile_id = (int) $spResult->fetch_assoc()['spa_id'];
    }
    $spLookup->close();
}
// Fall back to the service's joined spa_id
if ($spa_profile_id <= 0 && !empty($service['spa_id'])) {
    $spa_profile_id = (int) $service['spa_id'];
}
if ($spa_profile_id <= 0) {
    echo json_encode(array("status" => "error", "message" => "Could not resolve spa profile"));
    exit;
}
$total_amount = isset($_POST['total_amount']) ? floatval($_POST['total_amount']) : floatval($service['price']);

// Extract time from the booking_date datetime string (format: "2026-02-18 14:00:00")
$booking_time_val = null;
$timestamp = strtotime($booking_date);
if ($timestamp) {
    $booking_time_val = date('H:i:s', $timestamp);
}

// Store service name or list of services if passed
$services_list = isset($_POST['services']) ? $_POST['services'] : $service['service_name'];

$payment_method = isset($_POST['payment_method']) ? $_POST['payment_method'] : 'CASH';

// Insert booking - store in ALL relevant columns for compatibility
// DB has: booking_date (datetime), booking_time (time), status, booking_status, total_amount
if ($pet_id !== null && $pet_id > 0) {
    $stmt = $conn->prepare("INSERT INTO spa_bookings (pet_id, pet_source, service_id, spa_id, buyer_id, user_id, booking_date, booking_time, status, booking_status, payment_status, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'BOOKED', 'SUCCESS', ?, ?)");
    $stmt->bind_param("isiiiissds", $pet_id, $pet_source, $service_id, $spa_profile_id, $user_id, $user_id, $booking_date, $booking_time_val, $total_amount, $payment_method);
} else {
    $stmt = $conn->prepare("INSERT INTO spa_bookings (pet_id, pet_source, service_id, spa_id, buyer_id, user_id, booking_date, booking_time, status, booking_status, payment_status, total_amount, payment_method) VALUES (NULL, 'purchased', ?, ?, ?, ?, ?, ?, 'pending', 'BOOKED', 'SUCCESS', ?, ?)");
    $stmt->bind_param("iiiissds", $service_id, $spa_profile_id, $user_id, $user_id, $booking_date, $booking_time_val, $total_amount, $payment_method);
}

try {
    if ($stmt->execute()) {
        $booking_id = $stmt->insert_id;
        $bookDate = strtotime($booking_date);

        // Send notification to spa owner
        require_once 'send_fcm.php';
        $spaOwnerId = $spa_owner_id > 0 ? $spa_owner_id : (int) $service['spa_user_id'];
        sendFCMNotification(
            $spaOwnerId,
            'New Spa Booking!',
            'New booking for ' . $service['service_name'] . ' on ' . date("D d M, h:i A", $bookDate),
            'booking',
            $booking_id
        );

        echo json_encode(array(
            "status" => "success",
            "message" => "Spa booking confirmed",
            "booking_id" => $booking_id,
            "spa_name" => $service['spa_name'],
            "service_name" => $service['service_name'],
            "date" => date("D d M", $bookDate),
            "time" => date("h:i A", $bookDate),
            "location" => "Spa Visit",
            "amount" => "Rs." . number_format($total_amount, 0)
        ));
    } else {
        echo json_encode(array("status" => "error", "message" => "Failed to book spa: " . $stmt->error));
    }
} catch (Exception $e) {
    echo json_encode(array("status" => "error", "message" => "Database error: " . $e->getMessage()));
}

$stmt->close();
$conn->close();
?>