<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require 'db.php';
$res = $conn->query("DESCRIBE spa_bookings");
if (!$res) {
    echo "Error: " . $conn->error;
} else {
    while($row = $res->fetch_assoc()) {
        echo $row['Field'] . "\n";
    }
}
?>
