<?php
/**
 * CONSOLIDATED DOCTOR API  
 * Handles all doctor-related operations
 * 
 * Endpoints:
 * - get_list: Get list of all doctors
 * - get_dashboard: Get doctor dashboard stats
 */

header('Content-Type: application/json');
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get_list':
        getDoctorList();
        break;

    case 'get_dashboard':
        getDoctorDashboard();
        break;

    case 'get_booked_slots':
        getBookedSlots();
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}

// ========================================
// FUNCTION: Get doctor list
// ========================================
function getDoctorList()
{
    global $conn;

    $user_lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
    $user_lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
    $radius_km = 50; // 50km radius filter (covers full metro area)

    $distance_select = '';
    $having_clause = '';
    $order_clause = 'ORDER BY avg_rating DESC, u.full_name ASC';

    if ($user_lat !== null && $user_lng !== null && $user_lat != 0 && $user_lng != 0) {
        $lat = $conn->real_escape_string($user_lat);
        $lng = $conn->real_escape_string($user_lng);
        $distance_select = ",
            (6371 * acos(LEAST(1, GREATEST(-1,
                cos(radians($lat)) * cos(radians(u.latitude)) *
                cos(radians(u.longitude) - radians($lng)) +
                sin(radians($lat)) * sin(radians(u.latitude))
            )))) AS distance_km";
        $having_clause = "HAVING distance_km <= $radius_km";
        $order_clause = 'ORDER BY distance_km ASC';
    }

    try {
        $sql = "SELECT u.user_id, u.full_name, u.profile_image, u.phone,
                       u.address, u.city, u.state, u.is_verified,
                       u.latitude, u.longitude,
                       dp.specialization, dp.qualification, dp.experience, 
                       dp.hospital, dp.languages, dp.upi_id,
                       COALESCE(AVG(r.rating), 0) as avg_rating,
                       COUNT(r.review_id) as review_count
                       $distance_select
                FROM users u
                LEFT JOIN doctor_profiles dp ON u.user_id = dp.user_id
                LEFT JOIN reviews r ON u.user_id = r.target_user_id
                WHERE u.role = 'DOCTOR'
                GROUP BY u.user_id
                $having_clause
                $order_clause";

        $result = $conn->query($sql);
        $doctors = [];

        while ($row = $result->fetch_assoc()) {
            // Get the cheapest service price as consultation_fee
            $feeStmt = $conn->prepare("SELECT MIN(price) as min_price FROM doctor_services WHERE doctor_id = ?");
            $feeStmt->bind_param("i", $row['user_id']);
            $feeStmt->execute();
            $feeResult = $feeStmt->get_result()->fetch_assoc();
            $consultation_fee = $feeResult['min_price'] ? (int) $feeResult['min_price'] : 500;
            $feeStmt->close();

            $doctors[] = [
                'user_id' => (int) $row['user_id'],
                'full_name' => $row['full_name'],
                'profile_image' => $row['profile_image'],
                'phone' => $row['phone'],
                'address' => $row['address'],
                'city' => $row['city'] ?? '',
                'state' => $row['state'] ?? '',
                'is_verified' => (bool) $row['is_verified'],
                'specialization' => $row['specialization'] ?? 'General Vet',
                'qualification' => $row['qualification'] ?? '',
                'experience' => (int) ($row['experience'] ?? 0),
                'hospital' => $row['hospital'] ?? '',
                'languages' => $row['languages'] ?? '',
                'upi_id' => $row['upi_id'] ?? '',
                'avg_rating' => round((float) $row['avg_rating'], 1),
                'review_count' => (int) $row['review_count'],
                'consultation_fee' => $consultation_fee,
                'distance_km' => isset($row['distance_km']) ? round((float) $row['distance_km'], 1) : null,
                'about' => 'Experienced veterinarian specializing in ' . ($row['specialization'] ?? 'general pet care') . '. ' . (int) ($row['experience'] ?? 0) . ' years of practice at ' . ($row['hospital'] ?? 'clinic') . '.'
            ];
        }

        echo json_encode(['status' => 'success', 'doctors' => $doctors]);

    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ========================================
// FUNCTION: Get doctor dashboard stats
// ========================================
function getDoctorDashboard()
{
    global $conn;

    $doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : 0;

    if ($doctor_id <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid doctor ID']);
        return;
    }

    try {
        // Total appointments (all time)
        $sql = "SELECT COUNT(*) as total_appointments FROM doctor_appointments WHERE doctor_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $doctor_id);
        $stmt->execute();
        $total_appointments = $stmt->get_result()->fetch_assoc()['total_appointments'];

        // Completed appointments
        $sql = "SELECT COUNT(*) as completed_count FROM doctor_appointments 
                WHERE doctor_id = ? AND consultation_status = 'COMPLETED'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $doctor_id);
        $stmt->execute();
        $completed_appointments = $stmt->get_result()->fetch_assoc()['completed_count'];

        // Pending appointments
        $sql = "SELECT COUNT(*) as pending_count FROM doctor_appointments 
                WHERE doctor_id = ? AND consultation_status = 'BOOKED'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $doctor_id);
        $stmt->execute();
        $pending_appointments = $stmt->get_result()->fetch_assoc()['pending_count'];

        // Total earnings (base_amount + treatment_charge)
        $sql = "SELECT COALESCE(SUM(COALESCE(base_amount, 0) + COALESCE(treatment_charge, 0)), 0) as total_earnings 
                FROM doctor_appointments WHERE doctor_id = ? AND consultation_status = 'COMPLETED'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $doctor_id);
        $stmt->execute();
        $total_earnings = $stmt->get_result()->fetch_assoc()['total_earnings'];

        // Total patients count (unique)
        $sql = "SELECT COUNT(DISTINCT user_id) as total_patients FROM doctor_appointments WHERE doctor_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $doctor_id);
        $stmt->execute();
        $total_patients = $stmt->get_result()->fetch_assoc()['total_patients'];

        // Today's appointments count
        $sql = "SELECT COUNT(*) as appointments_today FROM doctor_appointments 
                WHERE doctor_id = ? AND DATE(appointment_date) = CURDATE() AND consultation_status != 'CANCELLED'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $doctor_id);
        $stmt->execute();
        $appointments_today = $stmt->get_result()->fetch_assoc()['appointments_today'];

        echo json_encode([
            'status' => 'success',
            'success' => true,
            'appointments_today' => (int) $appointments_today,
            'total_earnings' => floatval($total_earnings),
            'total_patients' => (int) $total_patients,
            'dashboard' => [
                'total_appointments' => (int) $total_appointments,
                'completed_appointments' => (int) $completed_appointments,
                'pending_appointments' => (int) $pending_appointments,
                'total_earnings' => floatval($total_earnings),
                'total_patients' => (int) $total_patients,
                'appointments_today' => (int) $appointments_today
            ]
        ]);

    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ========================================
// FUNCTION: Get booked time slots for a doctor on a date
// ========================================
function getBookedSlots()
{
    global $conn;

    $doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : 0;
    $date = isset($_GET['date']) ? $_GET['date'] : '';

    if ($doctor_id <= 0 || empty($date)) {
        echo json_encode(['status' => 'success', 'booked_slots' => []]);
        return;
    }

    // Parse the date from Android format "dd MMM yyyy" to "Y-m-d"
    $parsedDate = date_create_from_format('d M Y', $date);
    if (!$parsedDate) {
        $parsedDate = date_create($date);
    }

    if (!$parsedDate) {
        echo json_encode(['status' => 'success', 'booked_slots' => []]);
        return;
    }

    $dateStr = $parsedDate->format('Y-m-d');

    try {
        $sql = "SELECT booking_time FROM doctor_appointments 
                WHERE doctor_id = ? 
                AND DATE(appointment_date) = ?
                AND consultation_status IN ('BOOKED', 'CONFIRMED', 'IN_PROGRESS')";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $doctor_id, $dateStr);
        $stmt->execute();
        $result = $stmt->get_result();

        $bookedSlots = [];
        while ($row = $result->fetch_assoc()) {
            if (!empty($row['booking_time'])) {
                $bookedSlots[] = $row['booking_time'];
            }
        }
        $stmt->close();

        echo json_encode(['status' => 'success', 'booked_slots' => $bookedSlots]);

    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
    }
}

?>