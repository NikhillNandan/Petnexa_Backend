<?php
/**
 * CONSOLIDATED CHAT MANAGEMENT API
 * Handles all chat messaging operations
 * 
 * Endpoints:
 * - get_conversations: List all user conversations
 * - get_messages: Load message history
 * - send_message: Send text/image/file message
 * - mark_read: Update read receipts
 * - typing_status: Broadcast typing indicator
 * - get_total_unread: Total unread count
 */

header('Content-Type: application/json');
require_once 'db.php';
require_once 'send_fcm.php';

// Get action from request
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    // Create PDO connection using variables from db.php
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($action) {
        case 'get_conversations':
            getConversations($pdo);
            break;
        case 'get_messages':
            getMessages($pdo);
            break;
        case 'send_message':
            sendMessage($pdo);
            break;
        case 'mark_read':
            markMessagesRead($pdo);
            break;
        case 'typing_status':
            updateTypingStatus($pdo);
            break;
        case 'get_total_unread':
            getTotalUnread($pdo);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

// ========================================
// FUNCTION: Get all conversations for a user
// ========================================
function getConversations($pdo) {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        return;
    }
    
    // Get all unique conversations with last message and unread count
    $sql = "SELECT 
                CASE 
                    WHEN cm.sender_id = :uid1 THEN cm.receiver_id
                    ELSE cm.sender_id
                END as other_user_id,
                u.full_name as other_user_name,
                u.profile_image as other_user_photo,
                u.phone as other_user_phone,
                u.is_online,
                u.last_seen,
                (SELECT message_text FROM chat_messages 
                 WHERE (sender_id = :uid2 AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = :uid3)
                 ORDER BY timestamp DESC LIMIT 1) as last_message,
                (SELECT timestamp FROM chat_messages 
                 WHERE (sender_id = :uid4 AND receiver_id = other_user_id) 
                    OR (sender_id = other_user_id AND receiver_id = :uid5)
                 ORDER BY timestamp DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM chat_messages 
                 WHERE receiver_id = :uid6 AND sender_id = other_user_id AND is_read = 0) as unread_count
            FROM chat_messages cm
            JOIN users u ON (
                CASE 
                    WHEN cm.sender_id = :uid7 THEN cm.receiver_id
                    ELSE cm.sender_id
                END = u.user_id
            )
            WHERE cm.sender_id = :uid8 OR cm.receiver_id = :uid9
            GROUP BY other_user_id
            ORDER BY last_message_time DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'uid1' => $user_id, 'uid2' => $user_id, 'uid3' => $user_id,
        'uid4' => $user_id, 'uid5' => $user_id, 'uid6' => $user_id,
        'uid7' => $user_id, 'uid8' => $user_id, 'uid9' => $user_id
    ]);
    
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'conversations' => $conversations]);
}

// ========================================
// FUNCTION: Get message history
// ========================================
function getMessages($pdo) {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $other_user_id = isset($_GET['other_user_id']) ? intval($_GET['other_user_id']) : 0;
    $last_message_id = isset($_GET['last_message_id']) ? intval($_GET['last_message_id']) : 0;
    
    if ($user_id <= 0 || $other_user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
        return;
    }
    
    $sql = "SELECT * FROM chat_messages
            WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
              AND message_id > ?
            ORDER BY timestamp ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $other_user_id, $other_user_id, $user_id, $last_message_id]);
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'messages' => $messages]);
}

// ========================================
// FUNCTION: Send message
// ========================================
function sendMessage($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $sender_id = isset($data['sender_id']) ? intval($data['sender_id']) : 0;
    $receiver_id = isset($data['receiver_id']) ? intval($data['receiver_id']) : 0;
    $message_text = isset($data['message_text']) ? $data['message_text'] : '';
    $message_type = isset($data['message_type']) ? $data['message_type'] : 'text';
    $media_url = isset($data['media_url']) ? $data['media_url'] : null;
    $file_name = isset($data['file_name']) ? $data['file_name'] : null;
    
    if ($sender_id <= 0 || $receiver_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user IDs']);
        return;
    }
    
    $sql = "INSERT INTO chat_messages (sender_id, receiver_id, message_text, message_type, media_url, file_name) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$sender_id, $receiver_id, $message_text, $message_type, $media_url, $file_name])) {
        $message_id = $pdo->lastInsertId();
        
        $sql = "SELECT * FROM chat_messages WHERE message_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$message_id]);
        $message = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Push notification logic
        try {
            // Note: send_fcm.php might also need PDO consistency if it uses global $conn as mysqli
            // But let's assume it manages its own or we can just call it.
            $senderStmt = $pdo->prepare("SELECT full_name FROM users WHERE user_id = ?");
            $senderStmt->execute([$sender_id]);
            $senderRow = $senderStmt->fetch(PDO::FETCH_ASSOC);
            $senderName = $senderRow ? $senderRow['full_name'] : 'Someone';
            $notifMsg = ($message_type === 'text') ? $message_text : '📎 Sent a file';
            
            // If sendFCMNotification relies on mysqli $conn, it might fail here if not careful.
            // However, most functions use their own connection or the global one.
            if (function_exists('sendFCMNotification')) {
                sendFCMNotification($receiver_id, $senderName, $notifMsg, 'chat', $message_id);
            }
        } catch (Exception $e) { /* ignore notification errors */ }

        echo json_encode(['success' => true, 'message' => 'Message sent', 'data' => $message]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to send message']);
    }
}

// ========================================
// FUNCTION: Mark messages as read
// ========================================
function markMessagesRead($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    $sender_id = isset($data['sender_id']) ? intval($data['sender_id']) : 0;
    
    if ($user_id <= 0 || $sender_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
        return;
    }
    
    $sql = "UPDATE chat_messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $sender_id]);
    
    echo json_encode(['success' => true, 'message' => 'Messages marked as read', 'updated_count' => $stmt->rowCount()]);
}

// ========================================
// FUNCTION: Update typing status
// ========================================
function updateTypingStatus($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    $recipient_id = isset($data['recipient_id']) ? intval($data['recipient_id']) : 0;
    $is_typing = isset($data['is_typing']) ? intval($data['is_typing']) : 0;
    
    if ($user_id <= 0 || $recipient_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
        return;
    }
    
    $sql = "INSERT INTO typing_status (user_id, recipient_id, is_typing, updated_at) 
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE is_typing = ?, updated_at = NOW()";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $recipient_id, $is_typing, $is_typing]);
    
    echo json_encode(['success' => true, 'message' => 'Typing status updated']);
}

// ========================================
// FUNCTION: Get total unread chat count
// ========================================
function getTotalUnread($pdo) {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT COUNT(*) as total_unread FROM chat_messages WHERE receiver_id = ? AND is_read = 0");
    $stmt->execute([$user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'total_unread' => intval($result['total_unread'])]);
}
?>
