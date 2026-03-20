<?php
require_once 'db.php';

function addColumn($table, $column, $type)
{
    global $conn;
    $res = $conn->query("SHOW COLUMNS FROM $table LIKE '$column'");
    if ($res->num_rows == 0) {
        echo "Adding $column to $table...\n";
        $conn->query("ALTER TABLE $table ADD COLUMN $column $type");
    } else {
        echo "$column already exists in $table.\n";
    }
}

echo "Updating schema...\n";

// reviews table
addColumn('reviews', 'appointment_id', 'INT(11) DEFAULT NULL AFTER reviewer_id');
addColumn('reviews', 'transaction_id', 'INT(11) DEFAULT NULL AFTER appointment_id');

// spa_reviews table
addColumn('spa_reviews', 'booking_id', 'INT(11) DEFAULT NULL AFTER user_id');

echo "Schema update complete.\n";
?>