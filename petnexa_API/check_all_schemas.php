<?php
require_once 'db.php';

function checkTable($tableName)
{
    global $conn;
    echo "--- Table: $tableName ---\n";
    $result = $conn->query("SHOW COLUMNS FROM $tableName");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            echo "Field: " . $row['Field'] . " | Type: " . $row['Type'] . "\n";
        }
    } else {
        echo "Error: Table $tableName not found or error.\n";
    }
    echo "\n";
}

checkTable('users');
checkTable('seller_profiles');
checkTable('doctor_profiles');
checkTable('spa_profiles');
checkTable('buyer_profiles');
checkTable('reviews');
checkTable('spa_reviews');
?>