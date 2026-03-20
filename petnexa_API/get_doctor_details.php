<?php
/**
 * get_doctor_details.php - Get complete doctor details for buyer view (PDO Version)
 */

header('Content-Type: application/json');
require_once 'db.php';

$doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : 0;

if ($doctor_id <= 0) {
    echo json_encode(array('success' => false, 'message' => 'doctor_id is required'));
    exit;
}

try {
    // db.php provides $host, $dbname, $username, $password for PDO use
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1) Get doctor profile + user info
    $stmt = $pdo->prepare(
        "SELECT u.user_id, u.full_name, u.email, u.phone, u.profile_image, u.address, u.city, u.is_verified,
                dp.qualification, dp.specialization, dp.experience, dp.hospital, dp.languages, dp.upi_id
         FROM users u
         INNER JOIN doctor_profiles dp ON u.user_id = dp.user_id
         WHERE u.user_id = ?"
    );
    $stmt->execute([$doctor_id]);
    $doctor = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$doctor) {
        echo json_encode(array('success' => false, 'message' => 'Doctor not found'));
        exit;
    }

    // 2) Get services
    $services = array();
    $svc_stmt = $pdo->prepare("SELECT service_id, service_name, price, duration_minutes, description FROM doctor_services WHERE doctor_id = ?");
    $svc_stmt->execute([$doctor_id]);
    while ($row = $svc_stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['price'] = floatval($row['price']);
        $services[] = $row;
    }

    // If no services, add a default one
    if (empty($services)) {
        $services[] = [
            'service_id' => 1,
            'service_name' => 'General Consultation',
            'price' => 500.0,
            'duration_minutes' => 30,
            'description' => 'A basic health checkup for your pet.'
        ];
    }

    // 3) Get reviews
    $reviews = array();
    $rev_stmt = $pdo->prepare(
        "SELECT r.review_id, r.rating, r.comment AS review_text, r.created_at,
                u.full_name AS reviewer_name
         FROM reviews r
         INNER JOIN users u ON r.reviewer_id = u.user_id
         WHERE r.target_user_id = ?
         ORDER BY r.created_at DESC LIMIT 10"
    );
    $rev_stmt->execute([$doctor_id]);
    while ($row = $rev_stmt->fetch(PDO::FETCH_ASSOC)) {
        $reviews[] = $row;
    }

    echo json_encode(array(
        'success' => true,
        'doctor' => $doctor,
        'services' => $services,
        'reviews' => $reviews
    ));

} catch (Exception $e) {
    echo json_encode(array('success' => false, 'message' => 'Error: ' . $e->getMessage()));
}
?>
