<?php
require_once 'db.php';
$tables = ['pets', 'pet_images', 'certificates', 'user_pets'];
$schema = [];
foreach ($tables as $t) {
    if ($res = $conn->query("DESCRIBE $t")) {
        $schema[$t] = $res->fetch_all(MYSQLI_ASSOC);
    } else {
        $schema[$t] = "ERROR: " . $conn->error;
    }
}
header('Content-Type: application/json');
echo json_encode($schema, JSON_PRETTY_PRINT);
?>