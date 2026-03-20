<?php
// get_appointments.php - Fetch all appointments (doctor + spa) for a buyer
require_once 'db.php';

header('Content-Type: application/json');

// Use a session if user_id is missing (optional fallback)
$user_id = isset($_GET['user_id']) ? (int) $_GET['user_id'] : (isset($_GET['buyer_id']) ? (int) $_GET['buyer_id'] : 0);

if ($user_id <= 0) {
    echo json_encode(array("success" => false, "message" => "Valid user_id is required"));
    exit;
}

$appointments = array();

// 1. Doctor Appointments
// Join with pet source consideration
$doctorQuery = "SELECT da.appointment_id, da.doctor_id, da.appointment_date, da.booking_time,
                       da.consultation_status, da.service_name as booked_service,
                       da.visit_type, da.treatment_charge, da.base_amount, 
                       da.extra_paid_amount, da.extra_payment_status,
                       u.full_name as provider_name, u.phone as provider_phone, u.profile_image as provider_image,
                       dp.specialization, dp.hospital,
                       COALESCE(p.pet_name, up.pet_name) as pet_name,
                       (SELECT COUNT(*) FROM reviews r WHERE r.appointment_id = da.appointment_id) as review_count
                FROM doctor_appointments da
                INNER JOIN users u ON da.doctor_id = u.user_id
                LEFT JOIN doctor_profiles dp ON da.doctor_id = dp.user_id
                LEFT JOIN pets p ON da.pet_id = p.pet_id AND (da.pet_source IS NULL OR da.pet_source != 'manual')
                LEFT JOIN user_pets up ON da.pet_id = up.pet_id AND da.pet_source = 'manual'
                WHERE da.user_id = ?
                ORDER BY da.appointment_date DESC";

$stmt = $conn->prepare($doctorQuery);
if ($stmt) {
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $rawDate = $row['appointment_date'] ?? date('Y-m-d H:i:s');
        $apptDateTs = strtotime($rawDate);
        $displayDate = ($apptDateTs && $apptDateTs > 0) ? date("M d, Y", $apptDateTs) : 'N/A';
        $displayTime = !empty($row['booking_time']) ? $row['booking_time'] : (($apptDateTs && $apptDateTs > 0) ? date("h:i A", $apptDateTs) : 'N/A');
        
        $serviceName = !empty($row['booked_service']) ? $row['booked_service'] : ($row['specialization'] ?? "General Consultation");
        $visitType = $row['visit_type'] ?? 'clinic';
        $location = ($visitType === 'home') ? 'Home Visit' : ($row['hospital'] ?? 'Clinic Visit');
        $total_fee = floatval($row['base_amount'] ?? 0) + floatval($row['treatment_charge'] ?? 0);

        $appointments[] = array(
            "id" => (int) $row['appointment_id'],
            "provider_id" => (int) $row['doctor_id'],
            "type" => "Doctor Consultation",
            "provider_name" => $row['provider_name'] ?? "Doctor",
            "provider_phone" => $row['provider_phone'] ?? "",
            "provider_image" => $row['provider_image'] ?? "",
            "service_name" => $serviceName,
            "date" => $displayDate,
            "time" => $displayTime,
            "location" => $location,
            "visit_type" => $visitType,
            "fee" => number_format($total_fee, 0),
            "status" => $row['consultation_status'] ?? 'BOOKED',
            "pet_name" => $row['pet_name'] ?: "Pet",
            "raw_date" => $rawDate,
            "has_reviewed" => intval($row['review_count'] ?? 0) > 0,
            "extra_paid_amount" => floatval($row['extra_paid_amount'] ?? 0),
            "extra_payment_status" => $row['extra_payment_status'] ?? null
        );
    }
    $stmt->close();
}

// 2. Spa Bookings
$spaQuery = "SELECT sb.booking_id, sb.spa_id, sb.booking_date, sb.booking_time, sb.booking_status, 
                    sb.payment_status, sb.total_amount,
                    sp.spa_name as provider_name, u.phone as provider_phone, u.profile_image as provider_image,
                    sp.user_id as spa_user_id,
                    ss.service_name,
                    COALESCE(p.pet_name, up.pet_name) as pet_name,
                    (SELECT COUNT(*) FROM spa_reviews sr WHERE sr.booking_id = sb.booking_id) as review_count
             FROM spa_bookings sb
             LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
             LEFT JOIN spa_profiles sp ON sb.spa_id = sp.spa_id
             LEFT JOIN users u ON sp.user_id = u.user_id
             LEFT JOIN pets p ON sb.pet_id = p.pet_id AND (sb.pet_source IS NULL OR sb.pet_source != 'manual')
             LEFT JOIN user_pets up ON sb.pet_id = up.pet_id AND sb.pet_source = 'manual'
             WHERE sb.user_id = ?
             ORDER BY sb.booking_date DESC";

$stmt = $conn->prepare($spaQuery);
if ($stmt) {
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $rawDate = $row['booking_date'] ?? date('Y-m-d H:i:s');
        $bookDateTs = strtotime($rawDate);
        $displayDate = ($bookDateTs && $bookDateTs > 0) ? date("M d, Y", $bookDateTs) : 'N/A';
        $displayTime = !empty($row['booking_time']) ? $row['booking_time'] : (($bookDateTs && $bookDateTs > 0) ? date("h:i A", $bookDateTs) : 'N/A');

        $appointments[] = array(
            "id" => (int) $row['booking_id'],
            "provider_id" => (int) ($row['spa_user_id'] ?? 0),
            "spa_id" => (int) ($row['spa_id'] ?? 0),
            "type" => "Spa Service",
            "provider_name" => $row['provider_name'] ?? "Spa Center",
            "provider_phone" => $row['provider_phone'] ?? "",
            "provider_image" => $row['provider_image'] ?? "",
            "service_name" => $row['service_name'] ?? "Spa Service",
            "date" => $displayDate,
            "time" => $displayTime,
            "location" => "Spa Visit",
            "visit_type" => "spa",
            "fee" => number_format((float) ($row['total_amount'] ?? 0), 0),
            "status" => $row['booking_status'] ?? 'BOOKED',
            "pet_name" => $row['pet_name'] ?: "Pet",
            "raw_date" => $rawDate,
            "has_reviewed" => intval($row['review_count'] ?? 0) > 0
        );
    }
    $stmt->close();
}

// Sort all by date descending
if (!empty($appointments)) {
    usort($appointments, function ($a, $b) {
        $t1 = strtotime($a['raw_date'] ?? '0');
        $t2 = strtotime($b['raw_date'] ?? '0');
        return $t2 - $t1;
    });
}

// Split into upcoming and completed
$upcoming = array_values(array_filter($appointments, function ($a) {
    $s = strtoupper($a['status'] ?? '');
    return in_array($s, ['BOOKED', 'PENDING', 'CONFIRMED', 'ACCEPTED', 'APPROVED', 'IN_PROGRESS']);
}));
$completed = array_values(array_filter($appointments, function ($a) {
    $s = strtoupper($a['status'] ?? '');
    return in_array($s, ['COMPLETED', 'DONE', 'CANCELLED', 'DECLINED', 'REJECTED']);
}));

echo json_encode(array(
    "success" => true,
    "upcoming" => $upcoming,
    "completed" => $completed,
    "upcoming_count" => count($upcoming),
    "completed_count" => count($completed)
));

$conn->close();
?>