<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    exit;
}

try {
    $transactions = [];

    // Statuses that are considered "done" for a review
    $appointment_done_statuses = "'COMPLETED', 'DONE'";
    $purchase_done_statuses = "'CONFIRMED', 'COMPLETED', 'SUCCESS'";

    // 1. DOCTOR APPOINTMENTS
    // A. User as Buyer reviewing Doctor
    $stmt = $conn->prepare("
        SELECT 
            da.appointment_id AS txn_id,
            da.doctor_id AS target_id,
            COALESCE(u.full_name, 'Doctor') AS provider_name,
            COALESCE(da.service_name, 'Consultation') AS title,
            DATE_FORMAT(da.appointment_date, '%d %b %Y') AS date,
            (COALESCE(da.base_amount, 0) + COALESCE(da.treatment_charge, 0)) AS amount,
            'DOCTOR' AS category,
            'doctor' as type
        FROM doctor_appointments da
        JOIN users u ON u.user_id = da.doctor_id
        WHERE da.user_id = ?
          AND (TRIM(UPPER(da.consultation_status)) IN ($appointment_done_statuses) OR TRIM(UPPER(da.payment_status)) IN ($appointment_done_statuses))
          AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.appointment_id = da.appointment_id AND r.reviewer_id = ?)
    ");
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['total_amount'] = '₹' . number_format($row['amount']);
        $transactions[] = $row;
    }
    $stmt->close();

    // B. User as Doctor reviewing Buyer
    $stmt = $conn->prepare("
        SELECT 
            da.appointment_id AS txn_id,
            da.user_id AS target_id,
            COALESCE(u.full_name, 'Buyer') AS provider_name,
            COALESCE(da.service_name, 'Consultation') AS title,
            DATE_FORMAT(da.appointment_date, '%d %b %Y') AS date,
            (COALESCE(da.base_amount, 0) + COALESCE(da.treatment_charge, 0)) AS amount,
            'DOCTOR' AS category,
            'buyer' as type
        FROM doctor_appointments da
        JOIN users u ON u.user_id = da.user_id
        WHERE da.doctor_id = ?
          AND (TRIM(UPPER(da.consultation_status)) IN ($appointment_done_statuses) OR TRIM(UPPER(da.payment_status)) IN ($appointment_done_statuses))
          AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.appointment_id = da.appointment_id AND r.reviewer_id = ?)
    ");
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['total_amount'] = '₹' . number_format($row['amount']);
        $transactions[] = $row;
    }
    $stmt->close();

    // 2. SPA BOOKINGS
    // A. User as Buyer reviewing Spa
    $stmt = $conn->prepare("
        SELECT
            sb.booking_id AS txn_id,
            sb.spa_id AS target_id,
            COALESCE(s.spa_name, 'Spa') AS provider_name,
            COALESCE(ss.service_name, 'Spa Service') AS title,
            DATE_FORMAT(sb.booking_date, '%d %b %Y') AS date,
            COALESCE(sb.total_amount, 0) AS amount,
            'SPA' AS category,
            'spa' as type
        FROM spa_bookings sb
        JOIN spa_profiles s ON s.spa_id = sb.spa_id
        LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
        WHERE sb.user_id = ?
          AND (TRIM(UPPER(sb.booking_status)) IN ($appointment_done_statuses) OR TRIM(UPPER(sb.status)) IN ($appointment_done_statuses) OR TRIM(UPPER(sb.payment_status)) IN ($appointment_done_statuses))
          AND NOT EXISTS (SELECT 1 FROM spa_reviews sr WHERE sr.booking_id = sb.booking_id AND sr.user_id = ?)
    ");
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['total_amount'] = '₹' . number_format($row['amount']);
        $transactions[] = $row;
    }
    $stmt->close();

    // B. User as Spa reviewing Buyer (using spa owner's user_id)
    $stmt = $conn->prepare("
        SELECT
            sb.booking_id AS txn_id,
            sb.user_id AS target_id,
            COALESCE(u.full_name, 'Buyer') AS provider_name,
            COALESCE(ss.service_name, 'Spa Service') AS title,
            DATE_FORMAT(sb.booking_date, '%d %b %Y') AS date,
            COALESCE(sb.total_amount, 0) AS amount,
            'SPA' AS category,
            'buyer' as type
        FROM spa_bookings sb
        JOIN spa_profiles s ON s.spa_id = sb.spa_id
        JOIN users u ON u.user_id = sb.user_id
        LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
        WHERE s.user_id = ?
          AND (TRIM(UPPER(sb.booking_status)) IN ($appointment_done_statuses) OR TRIM(UPPER(sb.status)) IN ($appointment_done_statuses) OR TRIM(UPPER(sb.payment_status)) IN ($appointment_done_statuses))
          AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = sb.booking_id AND r.reviewer_id = ?)
    "); // Note: Using a offset/logic for provider reviewing buyer in spa if needed, but let's just use reviews table
    // For now, let's keep it simple. Usually providers review buyers in a 'buyer' type review.
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['total_amount'] = '₹' . number_format($row['amount']);
        $transactions[] = $row;
    }
    $stmt->close();

    // 3. PET TRANSACTIONS
    // A. User as Buyer reviewing Seller
    $stmt = $conn->prepare("
        SELECT
            pt.transaction_id AS txn_id,
            pt.seller_id AS target_id,
            COALESCE(u.full_name, 'Seller') AS provider_name,
            COALESCE(p.pet_name, 'Pet Purchase') AS title,
            DATE_FORMAT(pt.transaction_date, '%d %b %Y') AS date,
            COALESCE(pt.amount, 0) AS amount,
            'SELLER' AS category,
            'seller' as type
        FROM pet_transactions pt
        JOIN users u ON u.user_id = pt.seller_id
        LEFT JOIN pets p ON p.pet_id = pt.pet_id
        WHERE pt.buyer_id = ?
          AND TRIM(UPPER(pt.payment_status)) IN ($purchase_done_statuses)
          AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.transaction_id = pt.transaction_id AND r.reviewer_id = ?)
    ");
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['total_amount'] = '₹' . number_format($row['amount']);
        $transactions[] = $row;
    }
    $stmt->close();

    // B. User as Seller reviewing Buyer
    $stmt = $conn->prepare("
        SELECT
            pt.transaction_id AS txn_id,
            pt.buyer_id AS target_id,
            COALESCE(u.full_name, 'Buyer') AS provider_name,
            COALESCE(p.pet_name, 'Pet Sale') AS title,
            DATE_FORMAT(pt.transaction_date, '%d %b %Y') AS date,
            COALESCE(pt.amount, 0) AS amount,
            'SELLER' AS category,
            'buyer' as type
        FROM pet_transactions pt
        JOIN users u ON u.user_id = pt.buyer_id
        LEFT JOIN pets p ON p.pet_id = pt.pet_id
        WHERE pt.seller_id = ?
          AND TRIM(UPPER(pt.payment_status)) IN ($purchase_done_statuses)
          AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.transaction_id = pt.transaction_id AND r.reviewer_id = ?)
    ");
    $stmt->bind_param("ii", $user_id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $row['total_amount'] = '₹' . number_format($row['amount']);
        $transactions[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'transactions' => $transactions,
        'count' => count($transactions)
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'DB error: ' . $e->getMessage()]);
}
?>