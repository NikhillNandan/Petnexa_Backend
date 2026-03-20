<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'db.php';

// Support both listing_id and pet_id param names
$pet_id = isset($_GET['listing_id']) ? intval($_GET['listing_id']) : 0;
if ($pet_id <= 0) {
    $pet_id = isset($_GET['pet_id']) ? intval($_GET['pet_id']) : 0;
}

if ($pet_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid pet/listing ID'
    ]);
    exit;
}

$source = isset($_GET['source']) ? $_GET['source'] : 'listing';

try {
    $conn_pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($source === 'manual') {
        // Query for personal/manual pet
        $stmt = $conn_pdo->prepare("
            SELECT 
                p.pet_id,
                p.user_id as seller_id,
                p.pet_name,
                p.species,
                p.breed,
                p.age,
                p.gender,
                '' as color,
                0 as price,
                p.description,
                'PERSONAL' as availability_status,
                p.created_at,
                u.full_name AS seller_name,
                u.phone AS seller_phone,
                u.email AS seller_email,
                u.profile_image AS seller_image,
                '' AS seller_upi_id,
                p.image_url,
                p.vaccination_cert,
                p.health_cert,
                p.license_cert
            FROM user_pets p
            INNER JOIN users u ON p.user_id = u.user_id
            WHERE p.pet_id = ?
        ");
        $stmt->execute([$pet_id]);
        $pet = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pet) {
            echo json_encode(['success' => false, 'error' => 'Manual pet not found']);
            exit;
        }

        // Format certificates for manual pets
        $certificates = [];
        if ($pet['vaccination_cert'])
            $certificates[] = ['certificate_type' => 'Vaccination', 'certificate_file' => $pet['vaccination_cert']];
        if ($pet['health_cert'])
            $certificates[] = ['certificate_type' => 'Health', 'certificate_file' => $pet['health_cert']];
        if ($pet['license_cert'])
            $certificates[] = ['certificate_type' => 'License', 'certificate_file' => $pet['license_cert']];

        // Get multiple photos for manual pets
        $stmtImg = $conn_pdo->prepare("SELECT image_id, image_url FROM user_pet_images WHERE pet_id = ?");
        $stmtImg->execute([$pet_id]);
        $images = $stmtImg->fetchAll(PDO::FETCH_ASSOC);

        // Fallback to primary image if no gallery images found
        if (empty($images)) {
            $images = [['image_url' => $pet['image_url']]];
        }

        $primary_image = $pet['image_url'];
        $has_vaccination_cert = !empty($pet['vaccination_cert']);

    } else {
        // Standard listing query
        $stmt = $conn_pdo->prepare("
            SELECT 
                p.pet_id,
                p.seller_id,
                p.pet_name,
                p.species,
                p.breed,
                p.age,
                p.gender,
                p.color,
                p.price,
                p.description,
                p.availability_status,
                p.created_at,
                u.full_name AS seller_name,
                u.phone AS seller_phone,
                u.email AS seller_email,
                u.profile_image AS seller_image,
                sp.upi_id AS seller_upi_id,
                (SELECT buyer_id FROM pet_transactions WHERE pet_id = p.pet_id AND payment_status = 'CONFIRMED' LIMIT 1) as buyer_id
            FROM pets p
            INNER JOIN users u ON p.seller_id = u.user_id
            LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
            WHERE p.pet_id = ?
        ");

        $stmt->execute([$pet_id]);
        $pet = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pet) {
            echo json_encode(['success' => false, 'error' => 'Listing not found']);
            exit;
        }

        // Get photos
        $stmt = $conn_pdo->prepare("SELECT image_id, image_url FROM pet_images WHERE pet_id = ?");
        $stmt->execute([$pet_id]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $primary_image = count($images) > 0 ? $images[0]['image_url'] : null;

        // Get certificates
        $stmt = $conn_pdo->prepare("SELECT certificate_id, certificate_type, certificate_file FROM certificates WHERE pet_id = ?");
        $stmt->execute([$pet_id]);
        $certificates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $has_vaccination_cert = false;
        foreach ($certificates as $cert) {
            if (stripos($cert['certificate_type'], 'vaccin') !== false)
                $has_vaccination_cert = true;
        }
    }

    $formatted = [
        'pet_id' => intval($pet['pet_id']),
        'listing_id' => intval($pet['pet_id']),   // backward compat
        'seller_id' => intval($pet['seller_id']),
        'buyer_id' => isset($pet['buyer_id']) ? intval($pet['buyer_id']) : 0,
        'seller_name' => $pet['seller_name'],
        'seller_phone' => $pet['seller_phone'],
        'seller_email' => $pet['seller_email'],
        'seller_image' => $pet['seller_image'],
        'seller_upi_id' => $pet['seller_upi_id'],
        'pet_name' => $pet['pet_name'],
        'species' => $pet['species'],
        'breed' => $pet['breed'],
        'age' => intval($pet['age']),
        'gender' => $pet['gender'],
        'color' => $pet['color'] ?: '',
        'price' => floatval($pet['price']),
        'description' => $pet['description'],
        'status' => strtolower($pet['availability_status']),
        'vaccinated' => $has_vaccination_cert,
        'microchipped' => false,
        'weight' => '',
        'seller_verified' => false,
        'photo_url' => $primary_image,
        'image_url' => $primary_image,   // alias
        'images' => $images,
        'certificates' => $certificates,
        'created_at' => $pet['created_at']
    ];

    echo json_encode([
        'success' => true,
        'listing' => $formatted
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>