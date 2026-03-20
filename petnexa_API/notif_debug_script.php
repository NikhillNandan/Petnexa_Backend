<?php
$conn = new mysqli("localhost", "root", "", "petnexa_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$output = "--- Recent Notifications ---\n";
$result = $conn->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5");
if ($result) {
    while($row = $result->fetch_assoc()){
        $output .= "[" . $row['created_at'] . "] " . $row['title'] . ": " . $row['message'] . " (To User ID: " . $row['user_id'] . ")\n";
    }
} else {
    $output .= "Error: " . $conn->error . "\n";
}

$output .= "\n--- Users with FCM Tokens ---\n";
$result = $conn->query("SELECT user_id, full_name, role, length(fcm_token) as token_len FROM users WHERE fcm_token IS NOT NULL AND fcm_token != '' LIMIT 10");
if ($result) {
    while($row = $result->fetch_assoc()){
        $output .= "User ID: " . $row['user_id'] . " | " . $row['full_name'] . " (" . $row['role'] . ") | Token Length: " . $row['token_len'] . "\n";
    }
} else {
    $output .= "Error: " . $conn->error . "\n";
}

file_put_contents('c:\xampp\htdocs\petnexa_API\notif_debug.txt', $output);
echo "Debug completed.";
?>
