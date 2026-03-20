<?php
$conn = new mysqli("localhost", "root", "", "petnexa_db");
if ($conn->connect_error) die("Connection failed");
$res = $conn->query("DESC pet_transactions");
while($row = $res->fetch_assoc()) echo $row['Field'] . "\n";
?>
