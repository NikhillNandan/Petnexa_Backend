<?php
$conn = new mysqli("localhost", "root", "", "petnexa_db");
if ($conn->connect_error)
    die("Connect failed");
$tables = ['reviews', 'spa_reviews'];
foreach ($tables as $table) {
    echo "Table: $table\n";
    $res = $conn->query("DESCRIBE $table");
    while ($row = $res->fetch_assoc()) {
        echo $row['Field'] . " - " . $row['Type'] . " - " . $row['Default'] . "\n";
    }
}
?>