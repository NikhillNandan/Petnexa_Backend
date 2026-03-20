<?php
$c = new mysqli("localhost", "root", "", "petnexa_db");
if ($c->connect_error)
    die($c->connect_error);
function ch($t)
{
    global $c;
    $r = $c->query("DESC $t");
    if (!$r)
        return;
    while ($row = $r->fetch_assoc())
        echo $row['Field'] . " ";
    echo "\n";
}
echo "REVIEWS: ";
ch('reviews');
echo "SPA_REVIEWS: ";
ch('spa_reviews');
echo "DOC: ";
ch('doctor_appointments');
echo "SPA: ";
ch('spa_bookings');
echo "PET: ";
ch('pet_transactions');
?>