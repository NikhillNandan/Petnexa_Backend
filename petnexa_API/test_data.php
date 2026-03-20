<?php
$db = new mysqli('localhost', 'root', '', 'petnexa_db');
$r = $db->query('SELECT appointment_id, doctor_id, consultation_status, payment_status, payment_method, base_amount, treatment_charge FROM doctor_appointments');
while ($row = $r->fetch_assoc())
    echo json_encode($row) . "\n";
?>