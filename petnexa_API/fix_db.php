<?php
$host = "localhost";
$username = "root";
$password = "";
$dbname = "petnexa_db";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("ALTER TABLE doctor_appointments ADD COLUMN extra_payment_status VARCHAR(20) DEFAULT 'PENDING'");
    echo "Column added successfully";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "Column already exists";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>