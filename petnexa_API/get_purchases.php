<?php
/**
 * get_purchases.php - Get buyer's pet purchases
 * 
 * Uses pet_transactions table (actual DB schema) joined with:
 *   - pets: for pet details (name, species, breed)
 *   - pet_images: for pet photo
 *   - users: for seller name
 */
header('Content-Type: application/json');
require_once 'db.php';

$buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0;

if ($buyer_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid buyer ID']);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT 
            pt.transaction_id as purchase_id,
            pt.pet_id,
            pt.seller_id,
            pt.amount,
            pt.payment_method,
            pt.payment_status as status,
            pt.transaction_date as purchase_date,
            p.pet_name as item_name,
            p.species as purchase_type,
            p.breed,
            p.age,
            p.gender,
            u.full_name as seller_name,
            (SELECT pi.image_url FROM pet_images pi WHERE pi.pet_id = pt.pet_id LIMIT 1) as image_url,
            (SELECT COUNT(*) FROM reviews r 
             WHERE r.transaction_id = pt.transaction_id) as has_reviewed
        FROM pet_transactions pt
        INNER JOIN pets p ON pt.pet_id = p.pet_id
        LEFT JOIN users u ON pt.seller_id = u.user_id
        WHERE pt.buyer_id = ? AND pt.payment_status != 'REJECTED'
        ORDER BY pt.transaction_date DESC
    ");

    $stmt->bind_param("i", $buyer_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $purchases = [];
    while ($row = $result->fetch_assoc()) {
        // Add formatted price
        $row['amount'] = number_format(floatval($row['amount']), 2, '.', '');
        $purchases[] = $row;
    }

    echo json_encode([
        'success' => true,
        'purchases' => $purchases,
        'count' => count($purchases)
    ]);

    $stmt->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>