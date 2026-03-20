<?php
error_reporting(0);
ini_set('display_errors', 0);
ob_start();
// Increase limits for large base64 uploads (photos/certs)
ini_set('memory_limit', '256M');
ini_set('max_execution_time', '300');
ini_set('upload_max_filesize', '50M');
ini_set('post_max_size', '50M');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

date_default_timezone_set('Asia/Kolkata');

$host = "localhost";
$user = "root";
$username = "root"; // alias for PDO-based files
$password = "";
$database = "petnexa_db";
$dbname = "petnexa_db"; // alias for PDO-based files

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["error" => true, "message" => "Connection failed: " . $conn->connect_error]));
}
$conn->set_charset("utf8mb4");
?>