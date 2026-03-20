<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'db.php';
$res = $conn->query("DESC pet_transactions");
if (!$res) {
    echo "Error: " . $conn->error;
} else {
    $data = [];
    while ($row = $res->fetch_assoc()) $data[] = $row;
    echo json_encode($data, JSON_PRETTY_PRINT);
}
?>
