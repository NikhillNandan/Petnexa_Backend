<?php
require_once 'db.php';
function check($t)
{
    global $conn;
    echo "--- $t ---\n";
    $r = $conn->query("SHOW COLUMNS FROM $t");
    while ($row = $r->fetch_assoc())
        echo $row['Field'] . ", ";
    echo "\n\n";
}
check('doctor_appointments');
check('spa_bookings');
check('pet_transactions');
check('reviews');
check('spa_reviews');
?>