<?php
require_once 'db.php';
$target_id = 1; // Change to an actual seller ID if known
$type = 'seller';

$sql = "SELECT r.*, u.full_name as reviewer_name, u.profile_image
        FROM reviews r
        LEFT JOIN users u ON r.reviewer_id = u.user_id
        WHERE r.target_user_id = ?
        ORDER BY r.created_at DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die("Prepare failed: " . $conn->error);
}
$stmt->bind_param("i", $target_id);
if (!$stmt->execute()) {
    die("Execute failed: " . $stmt->error);
}
$result = $stmt->get_result();
$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode(['success' => true, 'reviews' => $reviews]);
?>