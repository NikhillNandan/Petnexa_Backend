<?php
require_once 'db.php';
$tables = ['doctor_profiles', 'spa_profiles', 'reviews', 'spa_reviews'];
$output = [];
foreach ($tables as $table) {
    try {
        $res = $conn->query("DESCRIBE $table");
        if ($res) {
            $cols = [];
            while($row = $res->fetch_assoc()) $cols[] = $row['Field'];
            $output[$table] = $cols;
        } else {
            $output[$table] = "Error: " . $conn->error;
        }
    } catch (Exception $e) {
        $output[$table] = "Error: " . $e->getMessage();
    }
}
echo json_encode($output, JSON_PRETTY_PRINT);
?>
