<?php
require_once 'db.php';
$result = $conn->query("SELECT * FROM reviews LIMIT 5");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "No reviews found or error: " . $conn->error;
}
?>