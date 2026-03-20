<?php
require_once 'db.php';
$output = "DATABASE SCHEMA CHECK\n";
$output .= "=====================\n\n";

$result = $conn->query("SHOW TABLES");
if ($result) {
    while ($row = $result->fetch_array()) {
        $tableName = $row[0];
        $output .= "TABLE: $tableName\n";
        $cols = $conn->query("DESCRIBE $tableName");
        if ($cols) {
            while ($col = $cols->fetch_assoc()) {
                $output .= "  - " . $col['Field'] . " (" . $col['Type'] . ")\n";
            }
        }
        $output .= "\n";
    }
} else {
    $output .= "ERROR: Could not fetch tables: " . $conn->error . "\n";
}

file_put_contents('schema_output.txt', $output);
echo "Schema written to schema_output.txt\n";
?>