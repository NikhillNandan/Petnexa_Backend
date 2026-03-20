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

        $stmt = $conn->prepare("
            SELECT 
                da.appointment_id,
                da.appointment_date,
                da.booking_time,
                da.service_name AS booked_services,
                da.visit_type,
                da.treatment_charge,
                da.base_amount,
                COALESCE(p.pet_name, up.pet_name) as pet_name,
                COALESCE(p.breed, up.breed) as breed,
                COALESCE(p.age, up.age) as age,
                COALESCE(p.species, up.species) as species,
                u.full_name AS owner_name,
                u.phone AS owner_phone
            FROM doctor_appointments da
            LEFT JOIN pets p ON da.pet_id = p.pet_id
            LEFT JOIN user_pets up ON da.pet_id = up.pet_id
            INNER JOIN users u ON da.user_id = u.user_id
            WHERE da.doctor_id = ? AND da.consultation_status IN ('BOOKED', 'PENDING')
            ORDER BY da.appointment_date ASC
        ");

    $stmt->execute([$doctor_id]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format requests
    $formatted_requests = [];
    foreach ($requests as $req) {
        $date = date('M d, Y', strtotime($req['appointment_date']));

        // Use booking_time column if available, otherwise extract from appointment_date
        $time = !empty($req['booking_time']) ? $req['booking_time'] : date('h:i A', strtotime($req['appointment_date']));

        // Determine age format
        $age_text = $req['age'] ? $req['age'] . ' months' : 'Unknown';

        $formatted_requests[] = [
            'appointment_id' => intval($req['appointment_id']),
            'pet_name' => $req['pet_name'] ?? 'N/A',
            'breed' => $req['breed'] ?: 'Unknown',
            'age' => $age_text,
            'species' => $req['species'] ?? 'N/A',
            'owner_name' => $req['owner_name'],
            'owner_phone' => $req['owner_phone'],
            'appointment_date' => $date,
            'appointment_time' => $time,
            'service_name' => $req['booked_services'] ?? 'General Consultation',
            'visit_type' => $req['visit_type'] ?? 'clinic',
            'base_amount' => floatval($req['base_amount'] ?? 0),
            'service_price' => floatval($req['base_amount'] ?? 0) + floatval($req['treatment_charge'] ?? 0),
            'status' => 'pending'
        ];
    }

    echo json_encode([
        'success' => true,
        'appointments' => $formatted_requests
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>