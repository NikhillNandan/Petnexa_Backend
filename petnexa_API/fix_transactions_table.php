<?php
// Disable output buffering and enable error reporting
while (ob_get_level()) ob_end_clean();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "root", "", "petnexa_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}

$columns_to_add = [
    'delivery_address' => "TEXT",
    'delivery_name' => "VARCHAR(100)",
    'delivery_phone' => "VARCHAR(20)"
];

foreach ($columns_to_add as $col => $type) {
    $res = $conn->query("SHOW COLUMNS FROM pet_transactions LIKE '$col'");
    if ($res->num_rows == 0) {
        if ($conn->query("ALTER TABLE pet_transactions ADD COLUMN $col $type")) {
            echo "Successfully added column: $col\n";
        } else {
            echo "Error adding column $col: " . $conn->error . "\n";
        }
    } else {
        echo "Column $col already exists\n";
    }
}

$conn->close();
echo "Migration finished.\n";
?>
