<?php
$c = new mysqli("localhost", "root", "", "petnexa_db");
if ($c->query("SHOW COLUMNS FROM `reviews` LIKE 'booking_id'")->num_rows == 0) {
    $c->query("ALTER TABLE `reviews` ADD COLUMN `booking_id` INT(11) AFTER transaction_id");
    echo "Added reviews.booking_id\n";
} else {
    echo "reviews.booking_id exists\n";
}
?>