<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$_GET['action'] = 'get_seller_orders';
$_GET['seller_id'] = 4;
include 'pet_order.php';
?>