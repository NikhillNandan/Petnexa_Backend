<?php
$url = "http://localhost/petnexa_API/pet_order.php?action=get_seller_orders&seller_id=4";
$response = file_get_contents($url);
echo $response;
?>