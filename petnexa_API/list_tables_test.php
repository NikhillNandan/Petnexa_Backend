<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$conn = new mysqli("localhost", "root", "", "petnexa_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$res = $conn->query("SHOW TABLES");
if (!$res) {
    echo "Error: " . $conn->error;
} else {
    while($row = $res->fetch_row()) {
        echo $row[0] . "\n";
    }
}
?>
