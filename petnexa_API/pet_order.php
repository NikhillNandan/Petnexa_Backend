<?php
/**
 * PET ORDER API
 * Handles pet booking/order operations
 * 
 * Actions:
 * - create: Create a new pet order (buyer)
 * - confirm: Seller confirms an order
 * - reject: Seller rejects an order
 * - get_seller_orders: Get all orders for a seller
 * - get_buyer_orders: Get all orders for a buyer
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'create':
        createOrder();
        break;
    case 'confirm':
        updateOrderStatus('CONFIRMED');
        break;
    case 'reject':
        updateOrderStatus('REJECTED');
        break;
    case 'get_seller_orders':
        getSellerOrders();
        break;
    case 'get_buyer_orders':
        getBuyerOrders();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// ========================================
// Create a new pet order
// ========================================
function createOrder()
{
    global $conn;

    $pet_id = isset($_POST['pet_id']) ? intval($_POST['pet_id']) : 0;
    $buyer_id = isset($_POST['buyer_id']) ? intval($_POST['buyer_id']) : 0;
    $seller_id = isset($_POST['seller_id']) ? intval($_POST['seller_id']) : 0;
    $amount = isset($_POST['amount']) ? floatval($_POST['amount']) : 0;
    $payment_method = isset($_POST['payment_method']) ? $_POST['payment_method'] : 'UPI';
    
    // Delivery info (newly added)
    $delivery_address = isset($_POST['delivery_address']) ? $_POST['delivery_address'] : '';
    $delivery_name = isset($_POST['delivery_name']) ? $_POST['delivery_name'] : '';
    $delivery_phone = isset($_POST['delivery_phone']) ? $_POST['delivery_phone'] : '';

    if ($pet_id <= 0 || $buyer_id <= 0 || $seller_id <= 0 || $amount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields: pet=' . $pet_id . ' buyer=' . $buyer_id . ' seller=' . $seller_id . ' amt=' . $amount]);
        return;
    }

    try {
        // Check if pet is still available
        $check = $conn->prepare("SELECT availability_status, pet_name FROM pets WHERE pet_id = ?");
        $check->bind_param("i", $pet_id);
        $check->execute();
        $petResult = $check->get_result()->fetch_assoc();

        if (!$petResult) {
            echo json_encode(['success' => false, 'message' => 'Pet not found']);
            return;
        }

        if (trim(strtolower($petResult['availability_status'])) !== 'available') {
            echo json_encode(['success' => false, 'message' => 'Pet is no longer available (Status: ' . $petResult['availability_status'] . ')']);
            return;
        }

        $petName = $petResult['pet_name'];

        // Insert transaction with BOOKED status
        $stmt = $conn->prepare("
            INSERT INTO pet_transactions (pet_id, buyer_id, seller_id, amount, payment_status, payment_method, delivery_address, delivery_name, delivery_phone, transaction_date)
            VALUES (?, ?, ?, ?, 'BOOKED', ?, ?, ?, ?, NOW())
        ");
        $stmt->bind_param("iiidssss", $pet_id, $buyer_id, $seller_id, $amount, $payment_method, $delivery_address, $delivery_name, $delivery_phone);
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to insert transaction: " . $stmt->error);
        }

        $transaction_id = $conn->insert_id;

        // Update pet status to reserved
        $update = $conn->prepare("UPDATE pets SET availability_status = 'RESERVED' WHERE pet_id = ?");
        $update->bind_param("i", $pet_id);
        $update->execute();

        // Send notification to seller
        try {
            require_once 'send_fcm.php';
            sendFCMNotification(
                $seller_id,
                'New Pet Order!',
                'You have a new order for ' . $petName . ' - ₹' . number_format($amount, 2),
                'order',
                $transaction_id
            );
        } catch (Throwable $fcmError) {
            error_log("FCM Notification failed: " . $fcmError->getMessage());
        }

        if (ob_get_length()) ob_clean();

        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully',
            'order' => [
                'transaction_id' => $transaction_id,
                'pet_id' => $pet_id,
                'pet_name' => $petName,
                'amount' => $amount,
                'payment_status' => 'BOOKED',
                'payment_method' => $payment_method,
                'transaction_date' => date('Y-m-d H:i:s')
            ]
        ]);

    } catch (Throwable $e) {
        if (ob_get_length()) ob_clean();
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ========================================
// Update order status (confirm/reject)
// ========================================
function updateOrderStatus($newStatus)
{
    global $conn;

    $transaction_id = isset($_POST['transaction_id']) ? intval($_POST['transaction_id']) : 0;
    $seller_id = isset($_POST['seller_id']) ? intval($_POST['seller_id']) : 0;

    error_log("updateOrderStatus called: transaction_id=$transaction_id, seller_id=$seller_id, newStatus=$newStatus");

    if ($transaction_id <= 0 || $seller_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields: tid=' . $transaction_id . ' sid=' . $seller_id]);
        return;
    }

    try {
        // Verify the order belongs to this seller
        $check = $conn->prepare("
            SELECT pet_id, payment_status FROM pet_transactions 
            WHERE transaction_id = ? AND seller_id = ?
        ");
        if (!$check) {
            echo json_encode(['success' => false, 'message' => 'DB prepare error: ' . $conn->error]);
            return;
        }
        $check->bind_param("ii", $transaction_id, $seller_id);
        $check->execute();
        $order = $check->get_result()->fetch_assoc();

        if (!$order) {
            // Also try without seller_id check for debugging
            $debugCheck = $conn->prepare("SELECT transaction_id, seller_id, payment_status FROM pet_transactions WHERE transaction_id = ?");
            $debugCheck->bind_param("i", $transaction_id);
            $debugCheck->execute();
            $debugRow = $debugCheck->get_result()->fetch_assoc();
            $debugInfo = $debugRow ? 'Found with seller_id=' . $debugRow['seller_id'] : 'Not found at all';
            echo json_encode(['success' => false, 'message' => 'Order not found for this seller. Debug: ' . $debugInfo]);
            return;
        }

        $currentStatus = strtoupper(trim($order['payment_status']));
        if ($currentStatus === 'CONFIRMED' || $currentStatus === 'REJECTED') {
            echo json_encode(['success' => false, 'message' => 'Order already ' . strtolower($currentStatus)]);
            return;
        }

        // Update transaction status
        $stmt = $conn->prepare("UPDATE pet_transactions SET payment_status = ? WHERE transaction_id = ?");
        $stmt->bind_param("si", $newStatus, $transaction_id);
        $result = $stmt->execute();

        if (!$result) {
            echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
            return;
        }

        // Fetch pet name and buyer_id for notification
        $petInfo = $conn->prepare("SELECT p.pet_name, pt.buyer_id FROM pets p JOIN pet_transactions pt ON p.pet_id = pt.pet_id WHERE pt.transaction_id = ?");
        $petInfo->bind_param("i", $transaction_id);
        $petInfo->execute();
        $info = $petInfo->get_result()->fetch_assoc();
        
        if ($info) {
            require_once 'send_fcm.php';
            $title = ($newStatus === 'CONFIRMED') ? 'Order Confirmed! 🎉' : 'Order Update';
            $msg = ($newStatus === 'CONFIRMED') 
                ? "Your order for " . $info['pet_name'] . " has been confirmed by the seller!" 
                : "Sorry, your order for " . $info['pet_name'] . " was rejected by the seller.";
            
            sendFCMNotification($info['buyer_id'], $title, $msg, 'order', $transaction_id);
        }

        // Update pet availability
        $pet_id = $order['pet_id'];
        if ($newStatus === 'CONFIRMED') {
            $petUpdate = $conn->prepare("UPDATE pets SET availability_status = 'SOLD' WHERE pet_id = ?");
        } else {
            // REJECTED -> make pet available again
            $petUpdate = $conn->prepare("UPDATE pets SET availability_status = 'AVAILABLE' WHERE pet_id = ?");
        }
        if ($petUpdate) {
            $petUpdate->bind_param("i", $pet_id);
            $petUpdate->execute();
        }

        echo json_encode([
            'success' => true,
            'message' => 'Order ' . strtolower($newStatus) . ' successfully',
            'status' => $newStatus
        ]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
    }
}

// ========================================
// Get seller orders
// ========================================
function getSellerOrders()
{
    global $conn;

    $seller_id = isset($_GET['seller_id']) ? intval($_GET['seller_id']) : 0;

    if ($seller_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid seller ID']);
        return;
    }

    try {
        $stmt = $conn->prepare("
            SELECT pt.transaction_id, pt.pet_id, pt.buyer_id, pt.amount, 
                   pt.payment_status, pt.payment_method, pt.transaction_date,
                   p.pet_name, p.species, p.breed, p.age,
                   (SELECT image_url FROM pet_images pi WHERE pi.pet_id = p.pet_id LIMIT 1) as photo_url,
                   u.full_name as buyer_name, u.phone as buyer_phone
            FROM pet_transactions pt
            LEFT JOIN pets p ON pt.pet_id = p.pet_id
            LEFT JOIN users u ON pt.buyer_id = u.user_id
            WHERE pt.seller_id = ?
            ORDER BY pt.transaction_date DESC
        ");
        $stmt->bind_param("i", $seller_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $row['amount'] = floatval($row['amount']);
            $row['age'] = intval($row['age']);
            $orders[] = $row;
        }

        echo json_encode(['success' => true, 'orders' => $orders]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ========================================
// Get buyer orders
// ========================================
function getBuyerOrders()
{
    global $conn;

    $buyer_id = isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : (isset($_GET['user_id']) ? intval($_GET['user_id']) : 0);

    if ($buyer_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid buyer ID']);
        return;
    }

    try {
        $stmt = $conn->prepare("
            SELECT pt.transaction_id, pt.pet_id, pt.seller_id, pt.amount,
                   pt.payment_status, pt.payment_method, pt.transaction_date,
                   p.pet_name, p.species, p.breed, 
                   (SELECT image_url FROM pet_images pi WHERE pi.pet_id = p.pet_id LIMIT 1) as photo_url,
                   u.full_name as seller_name, u.phone as seller_phone
            FROM pet_transactions pt
            LEFT JOIN pets p ON pt.pet_id = p.pet_id
            LEFT JOIN users u ON pt.seller_id = u.user_id
            WHERE pt.buyer_id = ?
            ORDER BY pt.transaction_date DESC
        ");
        $stmt->bind_param("i", $buyer_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $row['amount'] = floatval($row['amount']);
            $orders[] = $row;
        }

        echo json_encode(['success' => true, 'orders' => $orders]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

?>