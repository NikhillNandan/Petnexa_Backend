<?php
/**
 * CONSOLIDATED USER PROFILE API
 * Handles all user

 profile operations
 * 
 * Endpoints:
 * - get: Get profile data
 * - update: Update profile
 */

header('Content-Type: application/json');
require_once 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get':
        getProfile();
        break;
    
    case 'update':
        updateProfile();
        break;
    
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// ========================================
// FUNCTION: Get profile
// ========================================
function getProfile() {
    global $conn;
    
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $role = isset($_GET['role']) ? $_GET['role'] : '';
    
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        return;
    }
    
    try {
        // Get user data
        $sql = "SELECT * FROM users WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        
        // Get role-specific profile
        $profile = [];
        if ($role === 'SPA_OWNER') {
            $sql = "SELECT * FROM spa_profiles WHERE user_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $profile = $stmt->get_result()->fetch_assoc();
        } elseif ($role === 'DOCTOR') {
            $sql = "SELECT * FROM doctor_profiles WHERE user_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $profile = $stmt->get_result()->fetch_assoc();
        } elseif ($role === 'SELLER') {
            $sql = "SELECT * FROM seller_profiles WHERE user_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $profile = $stmt->get_result()->fetch_assoc();
        }
        
        echo json_encode([
            'success' => true,
            'user' => $user,
            'profile' => $profile
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

//========================================
// FUNCTION: Update profile
// ========================================
function updateProfile() {
    global $conn;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    $role = isset($_GET['role']) ? $_GET['role'] : '';
    
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
        return;
    }
    
    try {
        // Fetch current values to avoid overwriting with blanks (Critical for App/Web parity)
        $stmt_get = $conn->prepare("SELECT full_name, phone, address, upi_id, latitude, longitude FROM users WHERE user_id = ?");
        $stmt_get->bind_param("i", $user_id);
        $stmt_get->execute();
        $existing = $stmt_get->get_result()->fetch_assoc();
        
        if (!$existing) {
             echo json_encode(['success' => false, 'message' => 'User not found']);
             return;
        }

        // Use existing values as fallbacks
        $full_name = isset($data['full_name']) ? $data['full_name'] : $existing['full_name'];
        $phone = isset($data['phone']) ? $data['phone'] : $existing['phone'];
        $address = isset($data['address']) ? $data['address'] : $existing['address'];
        $upi_id = isset($data['upi_id']) ? $data['upi_id'] : $existing['upi_id'];
        $latitude = isset($data['latitude']) ? floatval($data['latitude']) : floatval($existing['latitude']);
        $longitude = isset($data['longitude']) ? floatval($data['longitude']) : floatval($existing['longitude']);
        
        $sql = "UPDATE users SET full_name = ?, phone = ?, address = ?, upi_id = ?, latitude = ?, longitude = ? WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssddi", $full_name, $phone, $address, $upi_id, $latitude, $longitude, $user_id);
        $stmt->execute();
        
        // Update role-specific profile
        if ($role === 'DOCTOR') {
            $updates = [];
            $types = "";
            $params = [];
            
            if (isset($data['qualification'])) { $updates[] = "qualification = ?"; $params[] = $data['qualification']; $types .= "s"; }
            if (isset($data['specialization'])) { $updates[] = "specialization = ?"; $params[] = $data['specialization']; $types .= "s"; }
            if (isset($data['experience'])) { $updates[] = "experience = ?"; $params[] = intval($data['experience']); $types .= "i"; }
            if (isset($data['hospital'])) { $updates[] = "hospital = ?"; $params[] = $data['hospital']; $types .= "s"; }
            elseif (isset($data['hospital_name'])) { $updates[] = "hospital = ?"; $params[] = $data['hospital_name']; $types .= "s"; }
            elseif (isset($data['clinic_name'])) { $updates[] = "hospital = ?"; $params[] = $data['clinic_name']; $types .= "s"; }
            if (isset($data['upi_id'])) { $updates[] = "upi_id = ?"; $params[] = $data['upi_id']; $types .= "s"; }
            
            if (!empty($updates)) {
                $sql = "UPDATE doctor_profiles SET " . implode(", ", $updates) . " WHERE user_id = ?";
                $params[] = $user_id;
                $types .= "i";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
            }
        } elseif ($role === 'SPA_OWNER') {
            $updates = [];
            $types = "";
            $params = [];
            
            if (isset($data['spa_name'])) { $updates[] = "spa_name = ?"; $params[] = $data['spa_name']; $types .= "s"; }
            if (isset($data['services_offered'])) { $updates[] = "services_offered = ?"; $params[] = $data['services_offered']; $types .= "s"; }
            elseif (isset($data['services'])) { $updates[] = "services_offered = ?"; $params[] = $data['services']; $types .= "s"; }
            if (isset($data['upi_id'])) { $updates[] = "upi_id = ?"; $params[] = $data['upi_id']; $types .= "s"; }
            
            if (!empty($updates)) {
                $sql = "UPDATE spa_profiles SET " . implode(", ", $updates) . " WHERE user_id = ?";
                $params[] = $user_id;
                $types .= "i";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
            }
        } elseif ($role === 'SELLER') {
            $updates = [];
            $types = "";
            $params = [];
            
            if (isset($data['shop_name'])) { $updates[] = "shop_name = ?"; $params[] = $data['shop_name']; $types .= "s"; }
            if (isset($data['upi_id'])) { $updates[] = "upi_id = ?"; $params[] = $data['upi_id']; $types .= "s"; }
            
            if (!empty($updates)) {
                $sql = "UPDATE seller_profiles SET " . implode(", ", $updates) . " WHERE user_id = ?";
                $params[] = $user_id;
                $types .= "i";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
            }
        }
        
        echo json_encode(['success' => true, 'message' => 'Profile updated']);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

?>
