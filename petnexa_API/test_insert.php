<?php
require 'db.php';
$conn->query("INSERT INTO reviews (target_user_id, reviewer_id, rating, comment) VALUES (2, 1, 3, 'test')");
$res = $conn->query("SELECT * FROM reviews");
while ($r = $res->fetch_assoc())
    echo json_encode($r) . "\n";
?>