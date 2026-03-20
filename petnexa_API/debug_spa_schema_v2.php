<?php
// debug_spa_schema_v2.php
$host = "localhost";
$username = "root";
$password = "";
$dbname = "petnexa_db";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $tables = ['spa_bookings', 'spa_services'];
    $schema = [];

    foreach ($tables as $table) {
        try {
            $stmt = $conn->query("DESCRIBE $table");
            $schema[$table] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $schema[$table] = "Error: " . $e->getMessage();
        }
    }

    echo json_encode($schema, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
