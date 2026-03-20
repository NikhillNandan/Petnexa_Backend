<?php
require_once 'send_fcm.php';

// Try to send a notification to a specific user (e.g. user_id 1)
$userId = 1;
$title = "Test Notification";
$message = "This is a test notification from the server.";

$success = sendFCMNotification($userId, $title, $message);

if ($success) {
    echo "FCM: Successfully sent to user 1\n";
} else {
    echo "FCM: Failed to send to user 1. Check if user 1 has an fcm_token and if the server has internet access.\n";
}

// Check what getFirebaseAccessToken returns
$token = getFirebaseAccessToken();
if ($token) {
    echo "Access Token generated successfully (first 10 chars): " . substr($token, 0, 10) . "...\n";
} else {
    echo "Failed to generate Firebase Access Token. Check your .json key file and openssl/curl extensions.\n";
}
?>
