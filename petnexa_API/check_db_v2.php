<?php
require_once 'db.php';
$output = "--- Users --- \n";
$result = $conn->query("SHOW COLUMNS FROM users");
while($row = $result->fetch_assoc()){
    $output .= $row['Field'] . "\n";
}
file_put_contents('db_check.txt', $output);
?>
