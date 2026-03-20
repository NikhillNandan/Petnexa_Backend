<?php
require_once 'db.php';
$seller_id = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : 1; // Default to 1 if not provided
$stmt = $conn->prepare("SELECT * FROM pet_transactions WHERE seller_id = ?");
$stmt->bind_param("i", $seller_id);
$stmt->execute();
$result = $stmt->get_result();
$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows, JSON_PRETTY_PRINT);
?>
