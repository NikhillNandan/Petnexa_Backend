<?php
require_once 'db.php';
$stmt = $conn->prepare("SELECT 1");
echo "Type: " . get_class($stmt);
?>
