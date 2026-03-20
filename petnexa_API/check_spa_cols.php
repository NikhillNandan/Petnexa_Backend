<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$pass = "";
$db = "petnexa_db";
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => $conn->connect_error]);
    exit;
}
$result = $conn->query("DESCRIBE spa_bookings");
$cols = [];
while ($row = $result->fetch_assoc()) {
    $cols[] = $row['Field'];
}
echo json_encode(["status" => "success", "columns" => $cols]);
?>