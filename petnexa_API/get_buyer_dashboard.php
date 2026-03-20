<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : (isset($_GET['user_id']) ? intval($_GET['user_id']) : 0);

if ($buyer_id <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid buyer ID']);
    exit;
}

try {
    $conn_pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get total purchases
    $stmt = $conn_pdo->prepare("SELECT COUNT(*) as count FROM pet_transactions WHERE buyer_id = ? AND payment_status IN ('CONFIRMED', 'BOOKED')");
    $stmt->execute([$buyer_id]);
    $purchases = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Get saved pets (wishlist) count
    $stmt = $conn_pdo->prepare("SELECT COUNT(*) as count FROM saved_pets WHERE buyer_id = ?");
    $stmt->execute([$buyer_id]);
    $wishlist = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Get reviews count
    $reviews = 0;

    // Regular reviews (doctor/seller)
    $stmt1 = $conn_pdo->prepare("SELECT COUNT(*) as count FROM reviews WHERE reviewer_id = ?");
    $stmt1->execute([$buyer_id]);
    $reviews += $stmt1->fetch(PDO::FETCH_ASSOC)['count'];

    // Spa reviews
    $stmt2 = $conn_pdo->prepare("SELECT COUNT(*) as count FROM spa_reviews WHERE user_id = ?");
    $stmt2->execute([$buyer_id]);
    $reviews += $stmt2->fetch(PDO::FETCH_ASSOC)['count'];

    echo json_encode([
        'success' => true,
        'purchases' => intval($purchases),
        'wishlist' => intval($wishlist),
        'reviews' => intval($reviews)
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>