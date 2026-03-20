<?php
/**
 * signup_spa.php - Spa Owner registration
 * Deploy this file to: htdocs/petnexa_API/signup_spa.php
 */

header('Content-Type: application/json');
require_once 'db.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Support both JSON body and form-encoded POST data
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data)
        $data = $_POST;

    $spa_name = isset($data['spa_name']) ? trim($data['spa_name']) : '';
    $owner_name = isset($data['full_name']) ? trim($data['full_name']) : (isset($data['owner_name']) ? trim($data['owner_name']) : '');
    $email = isset($data['email']) ? trim($data['email']) : '';
    $phone = isset($data['phone']) ? trim($data['phone']) : '';
    $password = isset($data['password']) ? trim($data['password']) : '';
    $services = isset($data['services_offered']) ? trim($data['services_offered']) : (isset($data['services']) ? trim($data['services']) : '');
    $upi_id = isset($data['upi_id']) ? trim($data['upi_id']) : '';
    $address = isset($data['address']) ? trim($data['address']) : '';
    $latitude = isset($data['latitude']) ? floatval($data['latitude']) : 0.0;
    $longitude = isset($data['longitude']) ? floatval($data['longitude']) : 0.0;

    // Validate required fields
    if (
        empty($owner_name) || empty($email) || empty($phone) || empty($password) ||
        empty($spa_name) || empty($services)
    ) {
        $response['error'] = true;
        $response['success'] = false;
        $response['message'] = 'All required fields must be filled';
        echo json_encode($response);
        exit;
    }

    if (strlen($password) < 8) {
        $response['error'] = true;
        $response['success'] = false;
        $response['message'] = 'Password must be at least 8 characters long';
        echo json_encode($response);
        exit;
    }

    // Check if email already exists
    $check = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        $response['error'] = true;
        $response['success'] = false;
        $response['message'] = 'Email already registered';
        echo json_encode($response);
        $check->close();
        exit;
    }
    $check->close();

    // Store password as plain text
    $password_hash = $password;
    $role = 'SPA_OWNER';

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Insert into users table
        $stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password_hash, role, address, latitude, longitude, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssdds", $owner_name, $email, $phone, $password_hash, $role, $address, $latitude, $longitude, $upi_id);
        $stmt->execute();
        $user_id = $conn->insert_id;
        $stmt->close();

        // Insert into spa_profiles table
        $stmt2 = $conn->prepare("INSERT INTO spa_profiles (user_id, spa_name, services_offered, upi_id) VALUES (?, ?, ?, ?)");
        $stmt2->bind_param("isss", $user_id, $spa_name, $services, $upi_id);
        $stmt2->execute();
        $spa_id = $conn->insert_id; // This is the id from spa_profiles
        $stmt2->close();

        // Automatically populate spa_services table
        $service_list = explode(',', $services);
        $stmt3 = $conn->prepare("INSERT INTO spa_services (spa_id, service_name, price, duration_minutes, description) VALUES (?, ?, ?, ?, ?)");
        $default_price = 0.0;
        $default_duration = 30;
        $default_desc = 'Default service added during signup';

        foreach ($service_list as $s_name) {
            $s_name = trim($s_name);
            if (!empty($s_name)) {
                $stmt3->bind_param("isdis", $spa_id, $s_name, $default_price, $default_duration, $default_desc);
                $stmt3->execute();
            }
        }
        $stmt3->close();

        $conn->commit();

        $response['error'] = false;
        $response['success'] = true;
        $response['message'] = 'Spa Owner registered successfully';
        $response['user_id'] = $user_id;

    } catch (Exception $e) {
        $conn->rollback();
        $response['error'] = true;
        $response['success'] = false;
        $response['message'] = 'Registration failed: ' . $e->getMessage();
    }

} else {
    $response['error'] = true;
    $response['success'] = false;
    $response['message'] = 'Invalid request method. Use POST.';
}

echo json_encode($response);
$conn->close();
?>