<?php
/**
 * get_spa_dashboard_stats.php - Get dashboard statistics for spa owner
 * Updated to fix rating query and improve data accuracy.
 */

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

require_once 'db.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'POST') {

    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($_POST['user_id']) ? intval($_POST['user_id']) : 0);

    if ($user_id <= 0) {
        $response['error'] = true;
        $response['message'] = 'User ID is required';
        echo json_encode($response);
        exit;
    }

    // Get spa_id from spa_profiles
    $spa_query = $conn->prepare("SELECT spa_id, services_offered FROM spa_profiles WHERE user_id = ?");
    $spa_query->bind_param("i", $user_id);
    $spa_query->execute();
    $spa_result = $spa_query->get_result();

    if ($spa_result->num_rows == 0) {
        $response['error'] = true;
        $response['message'] = 'Spa profile not found';
        echo json_encode($response);
        $spa_query->close();
        exit;
    }

    $spa_row = $spa_result->fetch_assoc();
    $spa_id = $spa_row['spa_id'];
    $spa_query->close();

    // 1) Today's Bookings (Active ones only)
    $today_date = date('Y-m-d');
    $today_q = $conn->prepare("SELECT COUNT(*) as count FROM spa_bookings 
                               WHERE spa_id = ? 
                               AND DATE(booking_date) = ?
                               AND LOWER(COALESCE(NULLIF(status, ''), NULLIF(booking_status, ''), 'booked')) 
                               NOT IN ('cancelled', 'rejected', 'declined', 'completed')");
    $today_q->bind_param("is", $spa_id, $today_date);
    $today_q->execute();
    $today_bookings = $today_q->get_result()->fetch_assoc()['count'] ?? 0;
    $today_q->close();

    // 2) Total Earnings (Confirmed/Paid/Completed)
    $total_earnings_query = $conn->prepare("SELECT SUM(COALESCE(NULLIF(sb.total_amount, 0), ss.price, 0)) as total 
                                          FROM spa_bookings sb 
                                          LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
                                          WHERE sb.spa_id = ? 
                                          AND LOWER(COALESCE(NULLIF(sb.status, ''), NULLIF(sb.booking_status, ''), 'booked')) 
                                          IN ('completed', 'confirmed', 'paid', 'booked', 'accepted', 'success')");
    $total_earnings_query->bind_param("i", $spa_id);
    $total_earnings_query->execute();
    $total_earnings = $total_earnings_query->get_result()->fetch_assoc()['total'] ?? 0;
    $total_earnings_query->close();

    // 3) Services Count (Excluding removed)
    $services_query = $conn->prepare("SELECT COUNT(*) as count FROM spa_services WHERE spa_id = ? AND (status IS NULL OR status != 'removed')");
    $services_query->bind_param("i", $spa_id);
    $services_query->execute();
    $services_count = $services_query->get_result()->fetch_assoc()['count'] ?? 0;
    $services_query->close();
    
    // Auto-backfill services if perfectly 0
    if ($services_count == 0 && !empty($spa_row['services_offered'])) {
        $offered_list = array_filter(array_map('trim', explode(',', $spa_row['services_offered'])));
        if (!empty($offered_list)) {
            $stmt_insert = $conn->prepare("INSERT INTO spa_services (spa_id, service_name, price, duration_minutes, description) VALUES (?, ?, 0.0, 30, 'Default service from profile')");
            foreach ($offered_list as $s_name) {
                $stmt_insert->bind_param("is", $spa_id, $s_name);
                $stmt_insert->execute();
            }
            $stmt_insert->close();
            $services_count = count($offered_list);
        }
    }

    // 4) Today's Earnings
    $today_date = date('Y-m-d');
    $today_earnings_query = $conn->prepare("SELECT SUM(COALESCE(NULLIF(sb.total_amount, 0), ss.price, 0)) as total 
                                          FROM spa_bookings sb
                                          LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
                                          WHERE sb.spa_id = ? 
                                          AND DATE(sb.booking_date) = ? 
                                          AND LOWER(COALESCE(NULLIF(sb.status, ''), NULLIF(sb.booking_status, ''), 'booked')) 
                                          IN ('completed', 'confirmed', 'paid', 'booked', 'accepted', 'success')");
    $today_earnings_query->bind_param("is", $spa_id, $today_date);
    $today_earnings_query->execute();
    $today_earnings = $today_earnings_query->get_result()->fetch_assoc()['total'] ?? 0;
    $today_earnings_query->close();

    // 5) Pending Bookings Count
    $pending_bookings_query = $conn->prepare("SELECT COUNT(*) as count 
                                            FROM spa_bookings 
                                            WHERE spa_id = ? 
                                            AND LOWER(COALESCE(NULLIF(status, ''), NULLIF(booking_status, ''), 'booked')) 
                                            IN ('booked', 'pending', 'requested')");
    $pending_bookings_query->bind_param("i", $spa_id);
    $pending_bookings_query->execute();
    $pending_bookings_count = $pending_bookings_query->get_result()->fetch_assoc()['count'] ?? 0;
    $pending_bookings_query->close();

    // 6) Total Bookings Count
    $total_bookings_query = $conn->prepare("SELECT COUNT(*) as count FROM spa_bookings WHERE spa_id = ?");
    $total_bookings_query->bind_param("i", $spa_id);
    $total_bookings_query->execute();
    $total_bookings = $total_bookings_query->get_result()->fetch_assoc()['count'] ?? 0;
    $total_bookings_query->close();

    // 7) Average Rating (Combine spa_reviews and generic reviews)
    $rating_sql = "
        SELECT COALESCE(AVG(rating), 0) as avg_rating 
        FROM (
            SELECT rating FROM spa_reviews WHERE spa_id = ?
            UNION ALL
            SELECT rating FROM reviews WHERE target_user_id = ?
        ) as combined_reviews";
    $rating_query = $conn->prepare($rating_sql);
    $rating_query->bind_param("ii", $spa_id, $user_id);
    $rating_query->execute();
    $rating_result = $rating_query->get_result()->fetch_assoc()['avg_rating'] ?? 0;
    $rating_query->close();

    $response['error'] = false;
    $response['message'] = 'Dashboard stats retrieved successfully';
    $response['stats'] = array(
        'today_bookings' => intval($today_bookings),
        'total_bookings' => intval($total_bookings),
        'average_rating' => round(floatval($rating_result), 1),
        'total_earnings' => floatval($total_earnings),
        'services_count' => intval($services_count),
        'today_earnings' => floatval($today_earnings),
        'pending_bookings' => intval($pending_bookings_count)
    );

} else {
    $response['error'] = true;
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
$conn->close();
?>