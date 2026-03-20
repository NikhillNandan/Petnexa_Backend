<?php
require_once 'db.php';
header('Content-Type: text/plain');

$queries = [
    "ALTER TABLE doctor_appointments ADD COLUMN pet_source ENUM('purchased', 'manual', 'market') DEFAULT 'purchased' AFTER pet_id",
    "ALTER TABLE spa_bookings ADD COLUMN pet_source ENUM('purchased', 'manual', 'market') DEFAULT 'purchased' AFTER pet_id"
];

foreach ($queries as $sql) {
    if ($conn->query($sql)) {
        echo "Success: $sql\n";
    } else {
        echo "Failed or Already Exists: " . $conn->error . "\n";
    }
}

$conn->close();
?>