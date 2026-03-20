<?php
$db = new mysqli('localhost', 'root', '', 'petnexa_db');
$db->query("ALTER TABLE reviews ADD COLUMN appointment_id INT NULL DEFAULT NULL AFTER reviewer_id");
$db->query("ALTER TABLE reviews ADD COLUMN transaction_id INT NULL DEFAULT NULL AFTER appointment_id");
$db->query("ALTER TABLE spa_reviews ADD COLUMN booking_id INT NULL DEFAULT NULL AFTER user_id");
echo "Alter table done";
?>