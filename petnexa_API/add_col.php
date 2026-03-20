<?php
require 'db.php';
$stmt = $conn->query("ALTER TABLE doctor_appointments ADD COLUMN extra_payment_status VARCHAR(20) DEFAULT 'PENDING'");
if ($stmt)
    echo "Success adding extra_payment_status";
else
    echo "Add col failed: " . $conn->error;
?>