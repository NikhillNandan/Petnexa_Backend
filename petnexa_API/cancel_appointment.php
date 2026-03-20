<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');

require_once 'db.php';

// Check if action is specified, default to cancellation
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : 'cancel');

$appointment_id = isset($_POST['appointment_id']) ? intval($_POST['appointment_id']) : (isset($_GET['appointment_id']) ? intval($_GET['appointment_id']) : 0);
$type = isset($_POST['type']) ? $_POST['type'] : (isset($_GET['type']) ? $_GET['type'] : 'doctor'); // 'doctor' or 'spa'
$buyer_id = isset($_POST['buyer_id']) ? intval($_POST['buyer_id']) : (isset($_GET['buyer_id']) ? intval($_GET['buyer_id']) : 0);

if ($appointment_id <= 0 || $buyer_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid parameters: apt=' . $appointment_id . ', buyer=' . $buyer_id]);
    exit;
}

try {
    if ($type === 'doctor') {
        $stmt = $conn->prepare("UPDATE doctor_appointments SET consultation_status = 'CANCELLED' WHERE appointment_id = ? AND user_id = ? AND consultation_status NOT IN ('Cancelled','CANCELLED')");
        if (!$stmt) throw new Exception($conn->error);
        $stmt->bind_param("ii", $appointment_id, $buyer_id);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();

        if ($affected > 0) {
            $stmt = $conn->prepare("SELECT doctor_id FROM doctor_appointments WHERE appointment_id = ?");
            $stmt->bind_param("i", $appointment_id);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            
            if ($res) {
                $doctor_user_id = $res['doctor_id'];
                require_once 'send_fcm.php';
                try {
                    sendFCMNotification($doctor_user_id, "Appointment Cancelled", "A patient has cancelled their appointment.", "appointment", $appointment_id);
                } catch (Exception $e) { }
            }
            echo json_encode(['success' => true, 'message' => 'Appointment cancelled successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Appointment already cancelled or not found']);
        }

    } elseif ($type === 'spa') {
        // Try to match against either user_id or buyer_id column for max compatibility
        $stmt = $conn->prepare("UPDATE spa_bookings SET booking_status = 'CANCELLED', status = 'Cancelled' WHERE booking_id = ? AND (user_id = ? OR buyer_id = ?) AND booking_status NOT IN ('Cancelled','CANCELLED')");
        if (!$stmt) throw new Exception($conn->error);
        $stmt->bind_param("iii", $appointment_id, $buyer_id, $buyer_id);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();

        if ($affected > 0) {
            $stmt = $conn->prepare("SELECT sp.user_id as owner_id FROM spa_bookings sb JOIN spa_profiles sp ON sb.spa_id = sp.spa_id WHERE sb.booking_id = ?");
            $stmt->bind_param("i", $appointment_id);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if ($res) {
                require_once 'send_fcm.php';
                try {
                    sendFCMNotification($res['owner_id'], "Booking Cancelled", "A customer has cancelled their spa booking.", "booking", $appointment_id);
                } catch (Exception $e) { }
            }
            echo json_encode(['success' => true, 'message' => 'Spa booking cancelled successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Booking already cancelled or not found']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid type: ' . $type]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
