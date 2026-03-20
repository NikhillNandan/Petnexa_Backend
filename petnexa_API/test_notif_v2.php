<?php
require_once 'send_fcm.php';

$output = "";

// Check what getFirebaseAccessToken returns
$token = getFirebaseAccessToken();
if ($token) {
    $output .= "Access Token generated successfully (first 10 chars): " . substr($token, 0, 10) . "...\n";
} else {
    $output .= "Failed to generate Firebase Access Token. Check your .json key file and openssl/curl extensions.\n";
}

// Try to send a notification to a specific user (e.g. user_id 1)
$userId = 1;
$title = "Test Notification";
$message = "This is a test notification from the server.";

$success = sendFCMNotification($userId, $title, $message);

if ($success) {
    $output .= "FCM: Successfully sent to user 1\n";
} else {
    $output .= "FCM: Failed to send to user 1. Check if user 1 has an fcm_token and if the server has internet access.\n";
}

file_put_contents('notif_test_res.txt', $output);
?>
