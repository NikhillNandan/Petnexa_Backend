<?php
require_once 'db.php';
$res = $conn->query("DESC pets");
$data = [];
while ($row = $res->fetch_assoc())
    $data[] = $row['Field'];
echo json_encode($data);
?>