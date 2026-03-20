<?php
require_once 'db.php';
header('Content-Type: text/plain');
$tables = ['pet_transactions', 'pet_orders', 'pets'];
foreach($tables as $t) {
    echo "--- $t ---\n";
    $res = $conn->query("DESCRIBE $t");
    if($res) {
        while($row = $res->fetch_assoc()) {
            echo $row['Field'] . " (" . $row['Type'] . ")\n";
        }
    } else {
        echo "Error: " . $conn->error . "\n";
    }
}
?>
