<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$_GET['action'] = 'get_transactions';
$_GET['user_id'] = 4;
$_GET['role'] = 'SELLER';
include 'transaction.php';
?>