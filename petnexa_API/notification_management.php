<?php
header('Content-Type: application/json');

// Suppress PHP warnings/notices from polluting JSON output
error_reporting(0);
ini_set('display_errors', 0);

require_once 'db.php';

// Parse the incoming JSON body if it exists
$jsonInput = json_decode(file_get_contents('php://input'), true);
if (!is_array($jsonInput)) {
    $jsonInput = [];
}

// Support multiple ways of receiving the action
$action = $_GET['action'] ?? $_POST['action'] ?? $jsonInput['action'] ?? '';

switch ($action) {
    case 'get_notifications':
        getNotifications($jsonInput);
        break;
    case 'get_unread_count':
        getUnreadCount($jsonInput);
        break;
    case 'mark_read':
        markRead($jsonInput);
        break;
    case 'mark_all_read':
        markAllRead($jsonInput);
        break;
    case 'register_token':
        registerToken($jsonInput);
        break;
    case 'delete_notification':
        deleteNotification($jsonInput);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action', 'received_action' => $action]);
        break;
}

function getNotifications($data) {
    global $conn;
    $userId = intval($_GET['user_id'] ?? $data['user_id'] ?? 0);
    $page = intval($_GET['page'] ?? $data['page'] ?? 1);
    $limit = 20;
    $offset = ($page - 1) * $limit;

    if ($userId <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user_id']);
        return;
    }

    // Get notifications
    $stmt = $conn->prepare("SELECT notification_id, user_id, title, message, type, reference_id, data, is_read, created_at
                            FROM notifications WHERE user_id = ? AND type != 'chat' ORDER BY created_at DESC LIMIT ? OFFSET ?");
    $stmt->bind_param("iii", $userId, $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();

    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
    $stmt->close();

    // Get unread count
    $stmt2 = $conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND type != 'chat'");
    $stmt2->bind_param("i", $userId);
    $stmt2->execute();
    $countResult = $stmt2->get_result()->fetch_assoc();
    $stmt2->close();

    // Get user role
    $stmt3 = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
    $stmt3->bind_param("i", $userId);
    $stmt3->execute();
    $userResult = $stmt3->get_result()->fetch_assoc();
    $stmt3->close();

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => intval($countResult['count']),
        'role' => $userResult['role'] ?? 'BUYER',
        'page' => $page
    ]);
}

function getUnreadCount($data) {
    global $conn;
    $userId = intval($_GET['user_id'] ?? $data['user_id'] ?? 0);

    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND type != 'chat'");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode(['success' => true, 'unread_count' => intval($result['count'])]);
}

function markRead($data) {
    global $conn;
    $notificationId = intval($data['notification_id'] ?? $_GET['notification_id'] ?? 0);

    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE notification_id = ?");
    $stmt->bind_param("i", $notificationId);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true]);
}

function markAllRead($data) {
    global $conn;
    $userId = intval($data['user_id'] ?? $_GET['user_id'] ?? 0);

    $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    echo json_encode(['success' => true, 'marked' => $affected]);
}

function registerToken($data) {
    global $conn;
    $userId = intval($data['user_id'] ?? 0);
    $token = $data['fcm_token'] ?? '';

    if ($userId <= 0 || empty($token)) {
        echo json_encode(['success' => false, 'message' => 'Invalid user_id or token']);
        return;
    }

    $stmt = $conn->prepare("UPDATE users SET fcm_token = ? WHERE user_id = ?");
    $stmt->bind_param("si", $token, $userId);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true, 'message' => 'Token registered']);
}

function deleteNotification($data) {
    global $conn;
    // VERY Robust ID retrieval
    $notificationId = 0;
    if (isset($data['notification_id'])) $notificationId = intval($data['notification_id']);
    if (!$notificationId && isset($_POST['notification_id'])) $notificationId = intval($_POST['notification_id']);
    if (!$notificationId && isset($_GET['notification_id'])) $notificationId = intval($_GET['notification_id']);

    if ($notificationId <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid notification_id: ' . json_encode($data) . ' / POST: ' . json_encode($_POST) . ' / GET: ' . json_encode($_GET)]);
        return;
    }

    $stmt = $conn->prepare("DELETE FROM notifications WHERE notification_id = ?");
    $stmt->bind_param("i", $notificationId);
    
    if ($stmt->execute()) {
        $affected = $stmt->affected_rows;
        $stmt->close();
        if ($affected > 0) {
            echo json_encode(['success' => true, 'message' => 'Notification deleted']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Notification already deleted or not found']);
        }
    } else {
        $error = $stmt->error;
        $stmt->close();
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $error]);
    }
}
?>
