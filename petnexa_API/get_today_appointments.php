<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once 'db.php';

// Fallback support for user_id (the app often passes user_id as doctor_id)
$user_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : (isset($_GET['user_id']) ? intval($_GET['user_id']) : 0);

if ($user_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid ID'
    ]);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // For Doctors, doctor_id in doctor_appointments table refers to the user_id from users table.
    // So we use the $user_id directly.
    $doctor_id = $user_id;
    $all = isset($_GET['all']) && $_GET['all'] == '1';

    $sql = "
        SELECT 
            da.appointment_id,
            da.appointment_date,
            da.booking_time,
            da.service_name AS booked_services,
            da.visit_type,
            da.consultation_status,
            da.treatment_charge,
            da.base_amount,
            da.payment_method,
            da.extra_paid_amount,
            da.extra_payment_status,
            COALESCE(p.pet_name, up.pet_name) as pet_name,
            COALESCE(p.species, up.species) as species,
            COALESCE(p.breed, up.breed) as breed,
            u.full_name AS owner_name,
            u.phone AS owner_phone
        FROM doctor_appointments da
        LEFT JOIN pets p ON da.pet_id = p.pet_id
        LEFT JOIN user_pets up ON da.pet_id = up.pet_id
        INNER JOIN users u ON da.user_id = u.user_id
        WHERE da.doctor_id = ? ";

    if (!$all) {
        $sql .= " AND DATE(da.appointment_date) = CURDATE()
                  AND da.consultation_status NOT IN ('CANCELLED', 'REJECTED', 'DECLINED', 'COMPLETED', 'DONE') ";
    }

    $sql .= " ORDER BY da.appointment_date ASC";

    $stmt = $conn->prepare($sql);
    $stmt->execute([$doctor_id]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format appointments
    $formatted_appointments = [];
    foreach ($appointments as $apt) {
        // Use booking_time column if available, otherwise extract from appointment_date
        $time = !empty($apt['booking_time']) ? $apt['booking_time'] : date('h:i A', strtotime($apt['appointment_date']));

        $formatted_appointments[] = [
            'appointment_id' => intval($apt['appointment_id']),
            'pet_name' => $apt['pet_name'] ?? 'N/A',
            'species' => $apt['species'] ?? 'N/A',
            'breed' => $apt['breed'] ?? 'N/A',
            'owner_name' => $apt['owner_name'],
            'owner_phone' => $apt['owner_phone'],
            'time' => $time,
            'service_name' => $apt['booked_services'] ?? 'General Consultation',
            'visit_type' => $apt['visit_type'] ?? 'clinic',
            'treatment_charge' => floatval($apt['treatment_charge'] ?? 0),
            'base_amount' => floatval($apt['base_amount'] ?? 0),
            'status' => $apt['consultation_status'],
            'payment_method' => $apt['payment_method'] ?? 'CASH',
            'extra_paid_amount' => floatval($apt['extra_paid_amount'] ?? 0),
            'extra_payment_status' => $apt['extra_payment_status'] ?? null
        ];
    }

    echo json_encode([
        'success' => true,
        'appointments' => $formatted_appointments
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>