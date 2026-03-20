<?php
require 'db.php';
$r = $conn->query('show columns from reviews');
while ($row = $r->fetch_assoc())
    echo json_encode($row) . "\n";
echo "SPA:\n";
$r = $conn->query('show columns from spa_reviews');
while ($row = $r->fetch_assoc())
    echo json_encode($row) . "\n";
$r = $conn->query('select * from reviews order by review_id desc limit 1');
while ($row = $r->fetch_assoc())
    echo json_encode($row) . "\n";
?>