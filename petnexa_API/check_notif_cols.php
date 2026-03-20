<?php
require_once 'db.php';
$res = $conn->query("DESCRIBE notifications");
$cols = [];
while($r = $res->fetch_assoc()) $cols[] = $r['Field'];
echo json_encode($cols);
?>
