<?php
/**
 * address_management.php - Full CRUD for delivery addresses
 * 
 * Actions:
 *   GET  ?action=get_addresses&user_id=X
 *   POST ?action=add_address
 *   POST ?action=update_address
 *   POST ?action=delete_address
 *   POST ?action=set_default
 */
header('Content-Type: application/json');
require_once 'db.php';

// Auto-create table if not exists
$conn->query("
    CREATE TABLE IF NOT EXISTS delivery_addresses (
        address_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        label VARCHAR(50) DEFAULT 'Home',
        full_name VARCHAR(100),
        phone VARCHAR(20),
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        is_default TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {

    case 'get_addresses':
        $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
        if ($user_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
            exit;
        }
        $stmt = $conn->prepare("SELECT * FROM delivery_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $addresses = [];
        while ($row = $result->fetch_assoc()) {
            $addresses[] = $row;
        }
        echo json_encode(['success' => true, 'addresses' => $addresses, 'count' => count($addresses)]);
        $stmt->close();
        break;

    case 'add_address':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
            exit;
        }

        $user_id = intval($data['user_id'] ?? 0);
        $label = $data['label'] ?? 'Home';
        $full_name = $data['full_name'] ?? '';
        $phone = $data['phone'] ?? '';
        $line1 = $data['address_line1'] ?? '';
        $line2 = $data['address_line2'] ?? '';
        $city = $data['city'] ?? '';
        $state = $data['state'] ?? '';
        $pincode = $data['pincode'] ?? '';
        $is_default = intval($data['is_default'] ?? 0);

        if ($user_id <= 0 || empty($full_name) || empty($line1) || empty($city)) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields (user_id, full_name, address_line1, city)']);
            exit;
        }

        // If setting as default, clear other defaults first
        if ($is_default) {
            $conn->query("UPDATE delivery_addresses SET is_default = 0 WHERE user_id = $user_id");
        }

        // If this is the first address, make it default
        $countResult = $conn->query("SELECT COUNT(*) as cnt FROM delivery_addresses WHERE user_id = $user_id");
        $countRow = $countResult->fetch_assoc();
        if ($countRow['cnt'] == 0) {
            $is_default = 1;
        }

        $stmt = $conn->prepare("INSERT INTO delivery_addresses (user_id, label, full_name, phone, address_line1, address_line2, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssssssi", $user_id, $label, $full_name, $phone, $line1, $line2, $city, $state, $pincode, $is_default);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Address added', 'address_id' => $stmt->insert_id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add address: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'update_address':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
            exit;
        }

        $address_id = intval($data['address_id'] ?? 0);
        $user_id = intval($data['user_id'] ?? 0);
        $label = $data['label'] ?? 'Home';
        $full_name = $data['full_name'] ?? '';
        $phone = $data['phone'] ?? '';
        $line1 = $data['address_line1'] ?? '';
        $line2 = $data['address_line2'] ?? '';
        $city = $data['city'] ?? '';
        $state = $data['state'] ?? '';
        $pincode = $data['pincode'] ?? '';
        $is_default = intval($data['is_default'] ?? 0);

        if ($address_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid address ID']);
            exit;
        }

        if ($is_default) {
            $conn->query("UPDATE delivery_addresses SET is_default = 0 WHERE user_id = $user_id");
        }

        $stmt = $conn->prepare("UPDATE delivery_addresses SET label=?, full_name=?, phone=?, address_line1=?, address_line2=?, city=?, state=?, pincode=?, is_default=? WHERE address_id=? AND user_id=?");
        $stmt->bind_param("ssssssssiis", $label, $full_name, $phone, $line1, $line2, $city, $state, $pincode, $is_default, $address_id, $user_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Address updated']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'delete_address':
        $data = json_decode(file_get_contents('php://input'), true);
        $address_id = intval($data['address_id'] ?? 0);
        $user_id = intval($data['user_id'] ?? 0);

        if ($address_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid address ID']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM delivery_addresses WHERE address_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $address_id, $user_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Address deleted']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete']);
        }
        $stmt->close();
        break;

    case 'set_default':
        $data = json_decode(file_get_contents('php://input'), true);
        $address_id = intval($data['address_id'] ?? 0);
        $user_id = intval($data['user_id'] ?? 0);

        if ($address_id <= 0 || $user_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid IDs']);
            exit;
        }

        $conn->query("UPDATE delivery_addresses SET is_default = 0 WHERE user_id = $user_id");
        $stmt = $conn->prepare("UPDATE delivery_addresses SET is_default = 1 WHERE address_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $address_id, $user_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Default address set']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to set default']);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action. Use: get_addresses, add_address, update_address, delete_address, set_default']);
        break;
}

$conn->close();
?>
