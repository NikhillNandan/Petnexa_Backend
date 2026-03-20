<?php
$conn = new mysqli("localhost", "root", "", "petnexa_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$output = "--- Users Table Columns ---\n";
$result = $conn->query("SHOW COLUMNS FROM users");
if ($result) {
    while($row = $result->fetch_assoc()){
        $output .= $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    $output .= "Error: " . $conn->error . "\n";
}

$output .= "\n--- Notifications Table ---\n";
$result = $conn->query("SHOW COLUMNS FROM notifications");
if ($result) {
    while($row = $result->fetch_assoc()){
        $output .= $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    $output .= "Error: " . $conn->error . "\n";
}

// Write as UTF-8 explicitly
$f = fopen('c:\xampp\htdocs\petnexa_API\schema_check_utf8.txt', 'w');
fwrite($f, $output);
fclose($f);
echo "Check completed.";
?>
