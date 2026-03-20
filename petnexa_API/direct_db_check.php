<?php
$conn = new mysqli("localhost", "root", "", "petnexa_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$output = "--- Users Table Columns ---\n";
$result = $conn->query("SHOW COLUMNS FROM users");
if ($result) {
    while($row = $result->fetch_assoc()){
        $output .= $row['Field'] . " - " . $row['Type'] . "\n";
    }
} else {
    $output .= "Error: " . $conn->error . "\n";
}

$output .= "\n--- Notifications Table ---\n";
$result = $conn->query("SHOW COLUMNS FROM notifications");
if ($result) {
    while($row = $result->fetch_assoc()){
        $output .= $row['Field'] . " - " . $row['Type'] . "\n";
    }
} else {
    $output .= "Error: " . $conn->error . "\n";
}

file_put_contents('c:\xampp\htdocs\petnexa_API\db_final_check.txt', $output);
echo "Check completed.";
?>
