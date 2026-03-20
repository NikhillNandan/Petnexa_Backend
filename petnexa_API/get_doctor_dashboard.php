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

    // Get today's appointments count (active/pending only)
    $stmt = $conn->prepare("
        SELECT COUNT(*) as count 
        FROM doctor_appointments 
        WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE() 
        AND consultation_status NOT IN ('CANCELLED', 'REJECTED', 'DECLINED', 'COMPLETED', 'DONE')
        AND consultation_status IN ('BOOKED', 'CONFIRMED', 'ACCEPTED', 'PENDING')
    ");
    $stmt->execute([$doctor_id]);
    $appointments_today = $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;

    // Get total earnings
    // Count everything that is completed, booked, or confirmed.
    $stmt = $conn->prepare("
        SELECT COALESCE(SUM(COALESCE(base_amount, 0) + COALESCE(treatment_charge, 0)), 0) as total 
        FROM doctor_appointments 
        WHERE doctor_id = ? AND consultation_status IN ('COMPLETED', 'BOOKED', 'CONFIRMED', 'ACCEPTED', 'PAID', 'DONE')
    ");
    $stmt->execute([$doctor_id]);
    $total_earnings = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // Get total unique patients
    $stmt = $conn->prepare("
        SELECT COUNT(DISTINCT user_id) as count 
        FROM doctor_appointments 
        WHERE doctor_id = ?
    ");
    $stmt->execute([$doctor_id]);
    $total_patients = $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;

    // Get average rating from reviews (target_user_id is the doctor's user_id)
    $avg_rating = 0.0;
    $stmt = $conn->prepare("SELECT AVG(rating) as avg_rating FROM reviews WHERE target_user_id = ?");
    $stmt->execute([$doctor_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $avg_rating = $row['avg_rating'] ? round(floatval($row['avg_rating']), 1) : 0.0;

    // Get experience years from doctor_profiles table (linked via user_id)
    $experience_years = 0;
    $stmt = $conn->prepare("SELECT experience FROM doctor_profiles WHERE user_id = ?");
    $stmt->execute([$doctor_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $experience_years = intval($row['experience']);
    }

    echo json_encode([
        'success' => true,
        'appointments_today' => intval($appointments_today),
        'total_earnings' => floatval($total_earnings),
        'total_patients' => intval($total_patients),
        'avg_rating' => $avg_rating,
        'experience_years' => $experience_years
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>