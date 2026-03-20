<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$pass = "";
$db = "petnexa_db";
$conn = new mysqli($host, $user, $pass, $db);
$result = $conn->query("SELECT review_id, rating, comment FROM reviews");
$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows);
?>