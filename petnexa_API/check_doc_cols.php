<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$pass = "";
$db = "petnexa_db";
$conn = new mysqli($host, $user, $pass, $db);
$result = $conn->query("SHOW COLUMNS FROM doctor_appointments");
$cols = [];
while ($row = $result->fetch_assoc()) {
    $cols[] = $row;
}
echo json_encode($cols);
?>