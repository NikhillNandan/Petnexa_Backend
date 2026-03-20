<?php
$c = new mysqli("localhost", "root", "", "petnexa_db");
if ($c->connect_error)
    die($c->connect_error);

function checkAndAdd($c, $table, $col, $type)
{
    if ($c->query("SHOW COLUMNS FROM `$table` LIKE '$col'")->num_rows == 0) {
        if (!$c->query("ALTER TABLE `$table` ADD COLUMN `$col` $type")) {
            echo "Failed $table.$col: " . $c->error . "\n";
        } else {
            echo "Added $table.$col\n";
        }
    } else {
        echo "$table.$col exists\n";
    }
}

checkAndAdd($c, 'reviews', 'appointment_id', 'INT(11) AFTER reviewer_id');
checkAndAdd($c, 'reviews', 'transaction_id', 'INT(11) AFTER appointment_id');
checkAndAdd($c, 'spa_reviews', 'booking_id', 'INT(11) AFTER user_id');
?>