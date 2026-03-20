<?php
require_once 'db.php';

echo "--- Users Table Columns ---\n";
$result = $conn->query("SHOW COLUMNS FROM users");
while($row = $result->fetch_assoc()){
    echo $row['Field'] . " - " . $row['Type'] . "\n";
}

echo "\n--- Notifications Table Columns ---\n";
$result = $conn->query("SHOW COLUMNS FROM notifications");
while($row = $result->fetch_assoc()){
    echo $row['Field'] . " - " . $row['Type'] . "\n";
}
?>
