<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'db.php';

$seller_id = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : 0;

if ($seller_id <= 0) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid seller ID'
    ]);
    exit;
}

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get all listings for this seller from the 'pets' table (consolidated)
    $stmt = $conn->prepare("
        SELECT 
            p.pet_id as listing_id,
            p.species as pet_type,
            p.breed,
            p.age,
            p.gender,
            p.price,
            p.description,
            p.availability_status as status,
            p.created_at,
            COUNT(DISTINCT pi.image_id) as photo_count,
            COUNT(DISTINCT c.certificate_id) as certificate_count
        FROM pets p
        LEFT JOIN pet_images pi ON p.pet_id = pi.pet_id
        LEFT JOIN certificates c ON p.pet_id = c.pet_id
        WHERE p.seller_id = ?
        GROUP BY p.pet_id
        ORDER BY p.created_at DESC
    ");
    
    $stmt->execute([$seller_id]);
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get photos and certificates for each listing
    $formatted_listings = [];
    foreach ($listings as $listing) {
        $listing_id = $listing['listing_id'];
        
        // Get primary photo from 'pet_images'
        $stmt = $conn->prepare("
            SELECT image_url as photo_url 
            FROM pet_images 
            WHERE pet_id = ? 
            ORDER BY image_id ASC 
            LIMIT 1
        ");
        $stmt->execute([$listing_id]);
        $photo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $formatted_listings[] = [
            'listing_id' => intval($listing['listing_id']),
            'pet_type' => $listing['pet_type'],
            'breed' => $listing['breed'],
            'age' => $listing['age'],
            'gender' => $listing['gender'],
            'price' => floatval($listing['price']),
            'description' => $listing['description'],
            'status' => $listing['status'],
            'photo_url' => $photo ? $photo['photo_url'] : null,
            'photo_count' => intval($listing['photo_count']),
            'certificate_count' => intval($listing['certificate_count']),
            'created_at' => $listing['created_at'],
            'updated_at' => $listing['updated_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'listings' => $formatted_listings,
        'total_count' => count($formatted_listings)
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
