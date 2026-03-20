<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$pass = "";
$db = "petnexa_db";
$conn = new mysqli($host, $user, $pass, $db);
$result = $conn->query("SELECT appointment_id, consultation_status, base_amount, treatment_charge FROM doctor_appointments");
$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows);
?>