<?php
/**
 * CONSOLIDATED TRANSACTION API
 * Handles earnings and transaction operations
 * 
 * Endpoints:
 * - get_earnings: Get earnings data
 * - get_transactions: Get transaction history
 */

header('Content-Type: application/json');
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get_earnings':
        getEarnings();
        break;
    
    case 'get_transactions':
        getTransactions();
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// ========================================
// FUNCTION: Get earnings data
// ========================================
function getEarnings() {
    global $conn;
    
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $role = strtoupper(trim(isset($_GET['role']) ? $_GET['role'] : ''));
    
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'error' => true, 'message' => 'Invalid user ID']);
        return;
    }
    
    try {
        $data = [
            'total_earnings' => 0,
            'pending_amount' => 0,
            'today_earnings' => 0,
            'week_earnings' => 0,
            'month_earnings' => 0,
            'total_orders' => 0,
            'confirmed_orders' => 0,
            'pending_orders' => 0,
            'rejected_orders' => 0
        ];
        
        if ($role === 'SELLER') {
            // Overall Stats
            $stmt = $conn->prepare("SELECT 
                        SUM(CASE WHEN payment_status IN ('CONFIRMED', 'PAID', 'SUCCESS', 'COMPLETED') THEN amount ELSE 0 END) as total,
                        SUM(CASE WHEN payment_status IN ('PENDING', 'BOOKED') THEN amount ELSE 0 END) as pending,
                        COUNT(*) as total_count,
                        SUM(CASE WHEN payment_status IN ('CONFIRMED', 'PAID', 'SUCCESS', 'COMPLETED') THEN 1 ELSE 0 END) as confirmed,
                        SUM(CASE WHEN payment_status IN ('PENDING', 'BOOKED') THEN 1 ELSE 0 END) as pending_cnt,
                        SUM(CASE WHEN payment_status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
                    FROM pet_transactions WHERE seller_id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();
            $data['total_earnings'] = floatval($res['total'] ?? 0);
            $data['pending_amount'] = floatval($res['pending'] ?? 0);
            $data['total_orders'] = intval($res['total_count'] ?? 0);
            $data['confirmed_orders'] = intval($res['confirmed'] ?? 0);
            $data['pending_orders'] = intval($res['pending_cnt'] ?? 0);
            $data['rejected_orders'] = intval($res['rejected'] ?? 0);

            // Time based stats
            $stmt = $conn->prepare("SELECT 
                        SUM(CASE WHEN DATE(transaction_date) = CURDATE() THEN amount ELSE 0 END) as today,
                        SUM(CASE WHEN transaction_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN amount ELSE 0 END) as week,
                        SUM(CASE WHEN transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as month
                    FROM pet_transactions WHERE seller_id = ? AND payment_status IN ('CONFIRMED', 'PAID', 'SUCCESS', 'COMPLETED')");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();
            $data['today_earnings'] = floatval($res['today'] ?? 0);
            $data['week_earnings'] = floatval($res['week'] ?? 0);
            $data['month_earnings'] = floatval($res['month'] ?? 0);

        } elseif ($role === 'SPA_OWNER') {
            // Get spa_id(s) for this user
            $stmt = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $spa_ids = [];
            $result = $stmt->get_result();
            while($row = $result->fetch_assoc()) $spa_ids[] = (int)$row['spa_id'];
            $stmt->close();
            
            if (!empty($spa_ids)) {
                $placeholders = implode(',', array_fill(0, count($spa_ids), '?'));
                $sql = "SELECT 
                            SUM(CASE WHEN LOWER(COALESCE(NULLIF(status, ''), NULLIF(booking_status, ''))) IN ('completed', 'confirmed', 'paid', 'booked', 'accepted', 'done', 'success') THEN total_amount ELSE 0 END) as total,
                            SUM(CASE WHEN LOWER(COALESCE(NULLIF(status, ''), NULLIF(booking_status, ''))) IN ('pending', 'requested') THEN total_amount ELSE 0 END) as pending,
                            SUM(CASE WHEN LOWER(COALESCE(NULLIF(status, ''), NULLIF(booking_status, ''))) IN ('completed', 'confirmed', 'paid', 'booked', 'accepted', 'done', 'success') AND DATE(booking_date) = CURDATE() THEN total_amount ELSE 0 END) as today,
                            SUM(CASE WHEN LOWER(COALESCE(NULLIF(status, ''), NULLIF(booking_status, ''))) IN ('completed', 'confirmed', 'paid', 'booked', 'accepted', 'done', 'success') AND booking_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN total_amount ELSE 0 END) as week,
                            SUM(CASE WHEN LOWER(COALESCE(NULLIF(status, ''), NULLIF(booking_status, ''))) IN ('completed', 'confirmed', 'paid', 'booked', 'accepted', 'done', 'success') AND booking_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total_amount ELSE 0 END) as month
                        FROM spa_bookings WHERE spa_id IN ($placeholders)";
                
                $stmt = $conn->prepare($sql);
                $stmt->bind_param(str_repeat('i', count($spa_ids)), ...$spa_ids);
                $stmt->execute();
                $res = $stmt->get_result()->fetch_assoc();
                $data['total_earnings'] = round(floatval($res['total'] ?? 0), 2);
                $data['pending_amount'] = round(floatval($res['pending'] ?? 0), 2);
                $data['today_earnings'] = round(floatval($res['today'] ?? 0), 2);
                $data['week_earnings'] = round(floatval($res['week'] ?? 0), 2);
                $data['month_earnings'] = round(floatval($res['month'] ?? 0), 2);
                $stmt->close();
            }

        } elseif ($role === 'DOCTOR') {
            $doctor_id = $user_id; // For doctors, doctor_id in appointments is the user_id from users table

            $stmt = $conn->prepare("SELECT 
                        SUM(CASE WHEN consultation_status IN ('COMPLETED', 'PAID', 'DONE') THEN (base_amount + treatment_charge) ELSE 0 END) as total,
                        SUM(CASE WHEN consultation_status IN ('PENDING', 'BOOKED', 'CONFIRMED', 'ACCEPTED') THEN (base_amount + treatment_charge) ELSE 0 END) as pending,
                        SUM(CASE WHEN consultation_status IN ('COMPLETED', 'PAID', 'DONE') AND DATE(appointment_date) = CURDATE() THEN (base_amount + treatment_charge) ELSE 0 END) as today,
                        SUM(CASE WHEN consultation_status IN ('COMPLETED', 'PAID', 'DONE') AND appointment_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND appointment_date <= NOW() THEN (base_amount + treatment_charge) ELSE 0 END) as week,
                        SUM(CASE WHEN consultation_status IN ('COMPLETED', 'PAID', 'DONE') AND appointment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND appointment_date <= NOW() THEN (base_amount + treatment_charge) ELSE 0 END) as month
                    FROM doctor_appointments WHERE doctor_id = ?");

            $stmt->bind_param("i", $doctor_id);
            $stmt->execute();
            $res = $stmt->get_result()->fetch_assoc();
            $data['total_earnings'] = floatval($res['total'] ?? 0);
            $data['pending_amount'] = floatval($res['pending'] ?? 0);
            $data['today_earnings'] = floatval($res['today'] ?? 0);
            $data['week_earnings'] = floatval($res['week'] ?? 0);
            $data['month_earnings'] = floatval($res['month'] ?? 0);
        }

        // Fetch Recent Transactions for all roles to be consistent
        $recent_transactions = [];
        if ($role === 'SELLER') {
            $sql = "SELECT pt.amount, pt.payment_status, pt.transaction_date, 
                           COALESCE(p.pet_name, p.breed, 'Pet') as pet_name, u.full_name as buyer_name, pt.payment_method
                    FROM pet_transactions pt
                    LEFT JOIN pets p ON pt.pet_id = p.pet_id
                    LEFT JOIN users u ON pt.buyer_id = u.user_id
                    WHERE pt.seller_id = ? ORDER BY pt.transaction_date DESC LIMIT 10";
        } elseif ($role === 'SPA_OWNER') {
            $sql = "SELECT sb.total_amount as amount, COALESCE(NULLIF(sb.status, ''), NULLIF(sb.booking_status, ''), 'BOOKED') as payment_status, sb.booking_date as transaction_date, 
                           COALESCE(ss.service_name, 'Grooming') as pet_name, u.full_name as buyer_name, sb.payment_method
                    FROM spa_bookings sb
                    LEFT JOIN users u ON sb.buyer_id = u.user_id
                    LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
                    WHERE sb.spa_id IN (SELECT spa_id FROM spa_profiles WHERE user_id = ?)
                    ORDER BY sb.booking_date DESC LIMIT 10";
        } elseif ($role === 'DOCTOR') {
            // Get doctor_id first if not already done
            if (!isset($doctor_id)) {
                $doc_stmt = $conn->prepare("SELECT doctor_id FROM doctor_profiles WHERE user_id = ?");
                $doc_stmt->bind_param("i", $user_id);
                $doc_stmt->execute();
                $doc_res = $doc_stmt->get_result()->fetch_assoc();
                $doctor_id = $doc_res['doctor_id'] ?? 0;
            }
            if ($doctor_id > 0) {
                $sql = "SELECT (da.base_amount + da.treatment_charge) as amount, da.consultation_status as payment_status, da.appointment_date as transaction_date, 
                               da.service_name as pet_name, u.full_name as buyer_name, da.payment_method
                        FROM doctor_appointments da
                        LEFT JOIN users u ON da.user_id = u.user_id
                        WHERE da.doctor_id = ? ORDER BY da.appointment_date DESC LIMIT 10";
            }
        }

        if (isset($sql)) {
            $stmt = $conn->prepare($sql);
            if ($role === 'DOCTOR') {
                $stmt->bind_param("i", $doctor_id);
            } else {
                $stmt->bind_param("i", $user_id);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) $recent_transactions[] = $row;
        }
        
        $final_res = array_merge($data, [
            'success' => true,
            'error' => false,
            'recent_transactions' => $recent_transactions,
            'message' => 'Earnings retrieved successfully'
        ]);
        echo json_encode($final_res);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => true, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ========================================
// FUNCTION: Get transactions
// ========================================
function getTransactions() {
    global $conn;
    
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $role = strtoupper(trim(isset($_GET['role']) ? $_GET['role'] : ''));
    
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'error' => true, 'message' => 'Invalid user ID']);
        return;
    }
    
    try {
        $transactions = [];
        
        if ($role === 'SELLER') {
            // Only show pet sales for the seller dashboard
            $sql = "SELECT 'Pet Sale' as type, COALESCE(p.pet_name, p.breed, p.species, 'Pet') as pet_name, p.pet_type, p.breed, u.full_name as other_party, 
                            pt.amount as amount, pt.payment_status as payment_status, pt.transaction_date as transaction_date, 
                            TIME(pt.transaction_date) as transaction_time, pt.payment_method, 'EARNING' as transaction_type
                     FROM pet_transactions pt
                     LEFT JOIN pets p ON pt.pet_id = p.pet_id
                     LEFT JOIN users u ON pt.buyer_id = u.user_id
                     WHERE pt.seller_id = ?
                     ORDER BY transaction_date DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $row['buyer_name'] = $row['other_party'];
                $transactions[] = $row;
            }
            echo json_encode(['success' => true, 'transactions' => $transactions]);
            return;
        } elseif ($role === 'BUYER') {
            // Consolidated buyer transactions from all tables
            $sql = "(SELECT 'Pet Purchase' as type, COALESCE(p.pet_name, p.breed, 'Pet') as pet_name, u.full_name as other_party, 
                            pt.amount as amount, pt.payment_status, pt.transaction_date as transaction_date, 
                            TIME(pt.transaction_date) as transaction_time, pt.payment_method, 'BOOKING' as transaction_type
                     FROM pet_transactions pt
                     LEFT JOIN pets p ON pt.pet_id = p.pet_id
                     LEFT JOIN users u ON pt.seller_id = u.user_id
                     WHERE pt.buyer_id = ?)
                    UNION ALL
                    (SELECT 'Consultation' as type, da.service_name as pet_name, u.full_name as other_party, 
                            (da.base_amount + da.treatment_charge) as amount, da.consultation_status as payment_status, 
                            da.appointment_date as transaction_date, da.booking_time as transaction_time, 
                            da.payment_method, 'BOOKING' as transaction_type
                     FROM doctor_appointments da
                     LEFT JOIN users u ON da.doctor_id = u.user_id
                     WHERE da.user_id = ?)
                    UNION ALL
                    (SELECT 'Grooming' as type, COALESCE(ss.service_name, 'Spa Service') as pet_name, u.full_name as other_party, 
                            sb.total_amount as amount, COALESCE(sb.booking_status, sb.payment_status, 'BOOKED') as payment_status, 
                            sb.booking_date as transaction_date, sb.booking_time as transaction_time, 
                            COALESCE(sb.payment_method, 'CASH') as payment_method, 'BOOKING' as transaction_type
                     FROM spa_bookings sb
                     LEFT JOIN spa_profiles sp ON sb.spa_id = sp.spa_id
                     LEFT JOIN users u ON sp.user_id = u.user_id
                     LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
                     WHERE COALESCE(sb.buyer_id, sb.user_id) = ?)
                    ORDER BY transaction_date DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iii", $user_id, $user_id, $user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                $row['buyer_name'] = $row['other_party'];
                $transactions[] = $row;
            }
            echo json_encode(['success' => true, 'transactions' => $transactions]);
            return;
        } elseif ($role === 'DOCTOR') {
            $doctor_id = $user_id;

            $sql = "SELECT da.appointment_id as transaction_id, da.consultation_status as payment_status,
                           da.appointment_date as transaction_date, da.booking_time as transaction_time, (da.base_amount + da.treatment_charge) as amount,
                           u.full_name as buyer_name, u.phone as buyer_phone,
                           da.service_name as pet_name, 'Consultation' as type, da.payment_method
                    FROM doctor_appointments da
                    LEFT JOIN users u ON da.user_id = u.user_id
                    WHERE da.doctor_id = ? ORDER BY da.appointment_date DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $doctor_id);
        } elseif ($role === 'SPA_OWNER') {
            $sql = "SELECT sb.booking_id as transaction_id, sb.booking_status as payment_status,
                           sb.booking_date as transaction_date, sb.booking_time as transaction_time, sb.total_amount as amount,
                           u.full_name as buyer_name, u.phone as buyer_phone,
                           COALESCE(ss.service_name, 'Spa Service') as pet_name, 'Grooming' as type, sb.payment_method
                    FROM spa_bookings sb
                    LEFT JOIN users u ON sb.buyer_id = u.user_id
                    LEFT JOIN spa_services ss ON sb.service_id = ss.service_id
                    WHERE sb.spa_id IN (SELECT spa_id FROM spa_profiles WHERE user_id = ?)
                    ORDER BY sb.booking_date DESC";
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid role']);
            return;
        }
        
        $bound_id = ($role === 'DOCTOR' ? $doctor_id : $user_id);
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $bound_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }
        
        echo json_encode(['success' => true, 'transactions' => $transactions]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

?>
