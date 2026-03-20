<?php
require_once 'db.php';
$res = $conn->query("DESCRIBE doctor_appointments");
$schema = [];
while($row = $res->fetch_assoc()) {
    $schema[] = $row;
}
echo json_encode($schema, JSON_PRETTY_PRINT);
?>
