<?php
require_once 'db.php';
$conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
$stmt = $conn->query("SHOW CREATE TABLE doctor_appointments");
print_r($stmt->fetch());
?>