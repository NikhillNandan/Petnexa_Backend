<?php
header('Content-Type: application/json');
require_once 'db.php';

$response = array();

try {
    // 1. Ensure spa_bookings has payment_method
    $cols_res = $conn->query("DESCRIBE spa_bookings");
    $cols = [];
    while($r = $cols_res->fetch_assoc()) $cols[] = $r['Field'];
    $response['actual_cols'] = $cols;
    
    if (!in_array('payment_method', $cols)) {
        $conn->query("ALTER TABLE spa_bookings ADD COLUMN payment_method VARCHAR(20) DEFAULT 'CASH'");
        $response['spa_bookings_payment_method'] = "Added";
    } else {
        $response['spa_bookings_payment_method'] = "Exists";
    }

    // 2. Ensure user_pet_images table exists
    $conn->query("CREATE TABLE IF NOT EXISTS user_pet_images (
        image_id INT AUTO_INCREMENT PRIMARY KEY,
        pet_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (pet_id)
    )");
    $response['user_pet_images_table'] = "Ensured";

    // 3. Ensure user_pets table has all needed columns (for consistency)
    $check_up = $conn->query("SHOW TABLES LIKE 'user_pets'");
    if ($check_up->num_rows == 0) {
        $conn->query("CREATE TABLE IF NOT EXISTS user_pets (
            pet_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            pet_name VARCHAR(100) NOT NULL,
            species VARCHAR(50) DEFAULT '',
            breed VARCHAR(100) DEFAULT '',
            age VARCHAR(50) DEFAULT '',
            gender VARCHAR(20) DEFAULT '',
            description TEXT,
            image_url VARCHAR(255),
            vaccination_cert VARCHAR(255),
            health_cert VARCHAR(255),
            license_cert VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        $response['user_pets_table'] = "Created";
    } else {
        $response['user_pets_table'] = "Exists";
    }

    echo json_encode(["success" => true, "details" => $response]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
