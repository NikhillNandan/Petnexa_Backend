<?php
require_once 'db.php';
$res = $conn->query("DESC pet_transactions");
$data = [];
while($row = $res->fetch_assoc()) $data[] = $row;
file_put_contents('schema_check.json', json_encode($data));
echo "Done";
?>
