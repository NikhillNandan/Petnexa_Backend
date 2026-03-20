<?php
require_once 'c:/xampp/htdocs/petnexa_API/db.php';
header('Content-Type: text/plain');

$q = $conn->query("SELECT * FROM spa_profiles");
if (!$q) {
    echo "Error: " . $conn->error . "\n";
} else {
    echo "SPA PROFILES:\n";
    while($row = $q->fetch_assoc()) {
        print_r($row);
    }
}

$q2 = $conn->query("SELECT spa_id, COUNT(*) as bookings_count FROM spa_bookings GROUP BY spa_id");
if (!$q2) {
    echo "Error: " . $conn->error . "\n";
} else {
    echo "\nSPA BOOKINGS COUNTS:\n";
    while($row = $q2->fetch_assoc()) {
        print_r($row);
    }
}
?>
