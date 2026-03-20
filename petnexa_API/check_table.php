<?php
require_once 'db.php';
$r = $conn->query('DESCRIBE users');
$columns = [];
while ($row = $r->fetch_assoc())
    $columns[] = $row;
echo json_encode($columns, JSON_PRETTY_PRINT);
?>