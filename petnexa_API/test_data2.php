<?php
error_reporting(E_ALL);
$db = new mysqli('localhost', 'root', '', 'petnexa_db');
$tables = ['doctor_appointments', 'pet_transactions', 'spa_bookings'];
foreach ($tables as $t) {
    echo "TABLE $t:\n";
    $r = $db->query("SELECT * FROM $t");
    if ($r) {
        while ($row = $r->fetch_assoc()) {
            echo json_encode($row) . "\n";
        }
    } else {
        echo "Error: " . $db->error . "\n";
    }
}
?>