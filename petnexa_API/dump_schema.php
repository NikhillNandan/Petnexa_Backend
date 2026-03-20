<?php
require_once 'db.php';
$conn = new mysqli($host, $username, $password, $dbname);
$tables = $conn->query("SHOW TABLES");
while ($table = $tables->fetch_array()) {
    echo "Table: " . $table[0] . "\n";
    $columns = $conn->query("DESCRIBE " . $table[0]);
    while ($column = $columns->fetch_assoc()) {
        echo "  " . $column['Field'] . " - " . $column['Type'] . "\n";
    }
}
?>