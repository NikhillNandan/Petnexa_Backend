<?php
require_once 'db.php';

try {
    // Add delivery columns to pet_transactions
    $columns = [
        'delivery_address' => "TEXT",
        'delivery_name' => "VARCHAR(100)",
        'delivery_phone' => "VARCHAR(20)"
    ];

    foreach ($columns as $col => $type) {
        $check = $conn->query("SHOW COLUMNS FROM pet_transactions LIKE '$col'");
        if ($check->num_rows == 0) {
            $conn->query("ALTER TABLE pet_transactions ADD COLUMN $col $type");
            echo "Added column: $col\n";
        } else {
            echo "Column already exists: $col\n";
        }
    }

    echo "Migration completed successfully";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
