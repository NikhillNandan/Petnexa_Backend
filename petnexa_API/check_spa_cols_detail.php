<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$pass = "";
$db = "petnexa_db";
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    exit;
}
$result = $conn->query("SHOW COLUMNS FROM spa_bookings");
$cols = [];
while ($row = $result->fetch_assoc()) {
    $cols[] = $row;
}
echo json_encode($cols);
?>