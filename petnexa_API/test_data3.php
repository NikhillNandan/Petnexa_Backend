<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$db = new mysqli('localhost', 'root', '', 'petnexa_db');
if ($db->connect_error) {
    file_put_contents('debug_data.txt', "Connection failed: " . $db->connect_error);
    exit;
}
$tables = ['doctor_appointments', 'pet_transactions', 'spa_bookings'];
$output = "";
foreach ($tables as $t) {
    $output .= "TABLE $t:\n";
    $r = $db->query("SELECT * FROM $t");
    if ($r) {
        if ($r->num_rows > 0) {
            while ($row = $r->fetch_assoc()) {
                $output .= json_encode($row) . "\n";
            }
        } else {
            $output .= "No rows found in $t\n";
        }
    } else {
        $output .= "Error in $t: " . $db->error . "\n";
    }
}
file_put_contents('debug_data.txt', $output);
echo "Debug data written to debug_data.txt";
?>