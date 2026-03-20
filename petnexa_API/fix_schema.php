<?php
require_once 'db.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Add columns if they don't exist
    $conn->exec("ALTER TABLE doctor_appointments ADD COLUMN IF NOT EXISTS base_amount DECIMAL(10,2) DEFAULT 0.00 AFTER visit_type");
    $conn->exec("ALTER TABLE doctor_appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'CASH' AFTER treatment_charge");
    $conn->exec("ALTER TABLE doctor_appointments ADD COLUMN IF NOT EXISTS payment_status ENUM('PENDING', 'PAID') DEFAULT 'PENDING' AFTER payment_method");
    $conn->exec("ALTER TABLE doctor_appointments ADD COLUMN IF NOT EXISTS extra_paid_amount DECIMAL(10,2) DEFAULT 0.00 AFTER payment_status");

    // Add upi_id to users table for processing payments
    $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100) DEFAULT NULL AFTER phone");

    echo "Schema updated successfully!";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>