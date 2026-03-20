<?php
require_once 'db.php';

$queries = [
    "ALTER TABLE doctor_appointments MODIFY COLUMN consultation_status ENUM('BOOKED', 'COMPLETED', 'CANCELLED', 'CONFIRMED', 'ACCEPTED', 'DONE', 'PAID', 'REJECTED', 'PENDING') DEFAULT 'BOOKED'",
    "ALTER TABLE spa_bookings MODIFY COLUMN booking_status ENUM('BOOKED', 'COMPLETED', 'CANCELLED', 'CONFIRMED', 'ACCEPTED', 'DONE', 'PAID', 'REJECTED', 'PENDING') DEFAULT 'BOOKED'"
];

foreach ($queries as $q) {
    if ($conn->query($q)) {
        echo "Successfully updated: $q\n";
    } else {
        echo "Error updating: " . $conn->error . "\n";
    }
}
?>
