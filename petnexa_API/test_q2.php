<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$db = new mysqli('localhost', 'root', '', 'petnexa_db');
if ($db->connect_error)
    die("DB error: " . $db->connect_error);
$r = $db->query('show columns from reviews');
if (!$r)
    die("Query error: " . $db->error);
while ($row = $r->fetch_assoc())
    echo json_encode($row) . "\n";
echo "SELECT:\n";
$r = $db->query('SELECT * FROM reviews ORDER BY review_id DESC LIMIT 3');
while ($row = $r->fetch_assoc())
    echo json_encode($row) . "\n";
?>