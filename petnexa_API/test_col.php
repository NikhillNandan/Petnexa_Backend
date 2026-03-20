<?php
$db = new mysqli('localhost', 'root', '', 'petnexa_db');
$res = "";
$r = $db->query('show columns from doctor_appointments');
while ($row = $r->fetch_assoc())
    $res .= json_encode($row) . "\n";
$res .= "==SELLER==\n";
$r = $db->query('show columns from pet_transactions');
while ($row = $r->fetch_assoc())
    $res .= json_encode($row) . "\n";
$res .= "==SPA==\n";
$r = $db->query('show columns from spa_bookings');
while ($row = $r->fetch_assoc())
    $res .= json_encode($row) . "\n";
file_put_contents('test_log.txt', $res);
?>