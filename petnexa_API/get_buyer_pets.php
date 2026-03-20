<?php
// get_buyer_pets.php - Fetch ALL pets for a buyer (purchased + manually added)
require_once 'db.php';

header('Content-Type: application/json');

// Support both user_id and buyer_id for backward compatibility
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0);

if ($user_id <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid User ID"]);
    exit;
}

try {
    // Defensive Table Management: Avoid "Table already exists" errors
    $tableExists = false;
    $checkResult = $conn->query("SHOW TABLES LIKE 'user_pets'");
    if ($checkResult && $checkResult->num_rows > 0) {
        $tableExists = true;
    }

    if (!$tableExists) {
        $legacyCheck = $conn->query("SHOW TABLES LIKE 'buyer_pets'");
        if ($legacyCheck && $legacyCheck->num_rows > 0) {
            $conn->query("RENAME TABLE buyer_pets TO user_pets");
        } else {
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )");
        }
    }

    $pets = [];

    // Query 1: Purchased pets (from pet_transactions + pets table)
    // For the buyer, these pets are always AVAILABLE for booking if they own them
    $purchased_sql = "SELECT DISTINCT p.pet_id, p.pet_name, p.species, p.breed, 
                        CAST(p.age AS CHAR) as age, p.gender, p.price,
                        'AVAILABLE' as availability_status,
                        (SELECT pi.image_url FROM pet_images pi WHERE pi.pet_id = p.pet_id LIMIT 1) as image_url,
                        'purchased' as source
                        FROM pet_transactions pt
                        INNER JOIN pets p ON pt.pet_id = p.pet_id
                        WHERE pt.buyer_id = ? AND pt.payment_status NOT IN ('FAILED', 'CANCELLED', 'REFUNDED')";

    $stmt1 = $conn->prepare($purchased_sql);
    $stmt1->bind_param("i", $user_id);
    $stmt1->execute();
    $result1 = $stmt1->get_result();
    while ($row = $result1->fetch_assoc()) {
        $pets[] = $row;
    }

    // Query 2: Manually added pets (from user_pets table)
    $manual_sql = "SELECT pet_id, pet_name, species, breed, 
                    age, gender, '0' as price, image_url,
                    'manual' as source, 'PERSONAL' as availability_status
                    FROM user_pets
                    WHERE user_id = ?";

    $stmt2 = $conn->prepare($manual_sql);
    $stmt2->bind_param("i", $user_id);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    while ($row = $result2->fetch_assoc()) {
        $pets[] = $row;
    }

    // Query 3: Pets listed for sale by this user (if they are a seller)
    $seller_sql = "SELECT pet_id, pet_name, species, breed, 
                    age, gender, price, 
                    (SELECT pi.image_url FROM pet_images pi WHERE pi.pet_id = pets.pet_id LIMIT 1) as image_url,
                    'listing' as source, availability_status
                    FROM pets
                    WHERE seller_id = ?";

    $stmt3 = $conn->prepare($seller_sql);
    $stmt3->bind_param("i", $user_id);
    $stmt3->execute();
    $result3 = $stmt3->get_result();
    while ($row = $result3->fetch_assoc()) {
        $pets[] = $row;
    }

    // Sort by pet_name if there are pets
    if (!empty($pets)) {
        usort($pets, function ($a, $b) {
            return strcasecmp($a['pet_name'] ?? '', $b['pet_name'] ?? '');
        });
    }

    echo json_encode(array(
        "success" => true,
        "pets" => $pets,
        "count" => count($pets)
    ));

} catch (Exception $e) {
    if (ob_get_length())
        ob_clean(); // Clear any pre-existing output
    echo json_encode(array("success" => false, "error" => "Error: " . $e->getMessage()));
}

$conn->close();
?>