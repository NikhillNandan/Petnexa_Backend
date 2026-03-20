<?php
require 'db.php';
$res = $conn->query("SELECT appointment_id, base_amount, treatment_charge, extra_paid_amount, extra_payment_status, payment_method FROM doctor_appointments ORDER BY appointment_id DESC LIMIT 3");
while ($row = $res->fetch_assoc()) {
    print_r($row);
}
?>