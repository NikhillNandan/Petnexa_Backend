<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'db.php';
$tables = ['reviews', 'spa_reviews'];
foreach ($tables as $table) {
    echo "--- $table ---\n";
    $result = $conn->query("DESCRIBE $table");
    while ($row = $result->fetch_assoc()) {
        print_r($row);
    }
}
?>