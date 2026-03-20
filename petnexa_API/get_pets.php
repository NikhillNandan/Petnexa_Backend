<?php
// get_pets.php - Fetch available pets with images and filters
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Get filter parameters
$species = isset($_GET['species']) ? trim($_GET['species']) : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // Standardize on PDO for consistency with modern parts of the API
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $query = "SELECT p.pet_id, p.seller_id, p.pet_name, p.species, p.breed, p.age, p.gender, 
                     p.color, p.price, p.description, p.availability_status,
                     u.full_name as seller_name, u.city as seller_city, u.phone as seller_phone,
                     (SELECT image_url FROM pet_images WHERE pet_id = p.pet_id LIMIT 1) as image_url
              FROM pets p
              INNER JOIN users u ON p.seller_id = u.user_id
              WHERE p.availability_status = 'AVAILABLE'";

    $params = [];

    if (!empty($species)) {
        $query .= " AND p.species = ?";
        $params[] = $species;
    }

    if (!empty($search)) {
        $query .= " AND (p.pet_name LIKE ? OR p.breed LIKE ? OR u.city LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $query .= " ORDER BY p.created_at DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data for frontend compatibility
    foreach ($pets as &$row) {
        $row['price'] = (float)$row['price'];
        $row['age'] = (int)$row['age'];
        $row['status'] = strtolower($row['availability_status']);
    }

    echo json_encode(["success" => true, "status" => "success", "pets" => $pets]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "status" => "error", "message" => "Failed to fetch pets: " . $e->getMessage()]);
}
?>
