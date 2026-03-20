<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'db.php';
if (ob_get_length())
    ob_end_clean(); // Clean the buffer from db.php
function c($t)
{
    global $conn;
    echo "--- $t ---\n";
    $r = $conn->query("DESCRIBE $t");
    if (!$r) {
        echo "Error: " . $conn->error . "\n";
        return;
    }
    while ($row = $r->fetch_assoc())
        echo $row['Field'] . ", ";
    echo "\n\n";
}
c('reviews');
c('spa_reviews');
c('doctor_appointments');
c('spa_bookings');
c('pet_transactions');
?>