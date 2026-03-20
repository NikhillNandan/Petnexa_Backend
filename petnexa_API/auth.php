<?php
/**
 * CONSOLIDATED AUTHENTICATION API
 * Handles all user authentication operations
 * 
 * Endpoints:
 * - login: User login
 * - signup: User registration (all roles)
 */

header('Content-Type: application/json');
require_once 'db.php';
require_once 'email_helper.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'login':
        login();
        break;

    case 'signup':
        signup();
        break;

    case 'verify_signup':
        verifySignup();
        break;

    case 'change_password':
        changePassword();
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

// ========================================
// FUNCTION: Login
// ========================================
function login()
{
    global $conn;

    $data = json_decode(file_get_contents('php://input'), true);

    $email = isset($data['email']) ? $data['email'] : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password required']);
        return;
    }

    try {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            // Simple password check (in production, use password_hash/password_verify)
            if ($user['password_hash'] === $password) {
                // Check if email is verified
                /* DISABLE VERIFICATION FOR TESTING
                if ($user['is_verified'] == 0) {
                    echo json_encode(['success' => false, 'message' => 'Email not verified. Please verify your email first.', 'unverified' => true]);
                    return;
                }
                */

                // Get role-specific profile data
                $profile_data = getRoleProfile($user['user_id'], $user['role']);

                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => array_merge($user, $profile_data)
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ========================================
// FUNCTION: Signup
// ========================================
function signup()
{
    global $conn;

    $data = json_decode(file_get_contents('php://input'), true);
    $role = isset($_GET['role']) ? strtoupper($_GET['role']) : 'BUYER';

    $full_name = isset($data['full_name']) ? $data['full_name'] : '';
    $email = isset($data['email']) ? $data['email'] : '';
    $phone = isset($data['phone']) ? $data['phone'] : '';
    $password = isset($data['password']) ? $data['password'] : '';
    $address = isset($data['address']) ? $data['address'] : '';
    $latitude = isset($data['latitude']) ? floatval($data['latitude']) : 0.0;
    $longitude = isset($data['longitude']) ? floatval($data['longitude']) : 0.0;
    $upi_id = isset($data['upi_id']) ? $data['upi_id'] : '';

    if (empty($full_name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Required fields missing']);
        return;
    }

    if (strlen($password) < 8) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
        return;
    }

    try {

        // Check if email exists
        $sql = "SELECT user_id, is_verified FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $existing_user = $result->fetch_assoc();
            if ($existing_user['is_verified'] == 1) {
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
                return;
            } else {
                // Unverified user exists, we will update it or allow re-signup
                // For simplicity, let's just delete the unverified user to start fresh
                $del_uid = $existing_user['user_id'];
                $conn->query("DELETE FROM users WHERE user_id = $del_uid");
                // Also delete profiles if they exist (cascading normally, but let's be safe if no cascade)
                $conn->query("DELETE FROM buyer_profiles WHERE user_id = $del_uid");
                $conn->query("DELETE FROM seller_profiles WHERE user_id = $del_uid");
                $conn->query("DELETE FROM doctor_profiles WHERE user_id = $del_uid");
                $conn->query("DELETE FROM spa_profiles WHERE user_id = $del_uid");
            }
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Insert user with upi_id, unverified
        $sql = "INSERT INTO users (full_name, email, phone, upi_id, password_hash, role, address, latitude, longitude, is_verified, reset_otp, otp_expires_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssddss", $full_name, $email, $phone, $upi_id, $password, $role, $address, $latitude, $longitude, $otp, $expiresAt);

        if ($stmt->execute()) {
            $user_id = $conn->insert_id;

            // Create role-specific profile
            createRoleProfile($user_id, $role, $data);

            // Send OTP email
            if (sendOtpEmail($email, $full_name, $otp, 'Verification')) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Registration successful. OTP sent to your email for verification.',
                    'user_id' => $user_id,
                    'verification_required' => true
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'message' => 'Registration successful, but failed to send OTP email. Please use forgot password to verify.',
                    'user_id' => $user_id,
                    'verification_required' => true
                ]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Registration failed']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

// ========================================
// FUNCTION: Verify Signup OTP
// ========================================
function verifySignup()
{
    global $conn;

    $data = json_decode(file_get_contents('php://input'), true);
    $email = isset($data['email']) ? trim($data['email']) : '';
    $otp = isset($data['otp']) ? trim(strval($data['otp'])) : '';

    if (empty($email) || empty($otp)) {
        echo json_encode(['success' => false, 'message' => 'Email and OTP are required']);
        return;
    }

    $stmt = $conn->prepare("SELECT reset_otp, otp_expires_at FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        return;
    }

    $user = $result->fetch_assoc();

    if ($user['reset_otp'] === null) {
        echo json_encode(['success' => false, 'message' => 'No verification code was sent.']);
        return;
    }

    if (strtotime($user['otp_expires_at']) < time()) {
        echo json_encode(['success' => false, 'message' => 'OTP has expired. Please try signing up again.']);
        return;
    }

    if (strval($user['reset_otp']) !== strval($otp)) {
        echo json_encode(['success' => false, 'message' => 'Invalid OTP. Please try again.']);
        return;
    }

    // Mark as verified and clear OTP
    $stmt = $conn->prepare("UPDATE users SET is_verified = 1, reset_otp = NULL, otp_expires_at = NULL WHERE email = ?");
    $stmt->bind_param("s", $email);

    if ($stmt->execute()) {
        // Fetch user data to return
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmtSelected = $conn->prepare($sql);
        $stmtSelected->bind_param("s", $email);
        $stmtSelected->execute();
        $user_res = $stmtSelected->get_result();
        $user_data = $user_res->fetch_assoc();
        
        $profile_data = getRoleProfile($user_data['user_id'], $user_data['role']);
        $full_user = array_merge($user_data, $profile_data);

        echo json_encode(['success' => true, 'message' => 'Email verified successfully!', 'user' => $full_user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to verify email.']);
    }
}

// ========================================
// HELPER: Get role-specific profile
// ========================================
function getRoleProfile($user_id, $role)
{
    global $conn;
    $profile = [];

    switch ($role) {
        case 'BUYER':
            $sql = "SELECT * FROM buyer_profiles WHERE user_id = ?";
            break;
        case 'SELLER':
            $sql = "SELECT * FROM seller_profiles WHERE user_id = ?";
            break;
        case 'DOCTOR':
            $sql = "SELECT * FROM doctor_profiles WHERE user_id = ?";
            break;
        case 'SPA':
        case 'SPA_OWNER':
            $sql = "SELECT * FROM spa_profiles WHERE user_id = ?";
            break;
        default:
            return $profile;
    }

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $profile = $result->fetch_assoc();
    }

    return $profile;
}

// ========================================
// HELPER: Create role-specific profile
// ========================================
function createRoleProfile($user_id, $role, $data)
{
    global $conn;

    switch ($role) {
        case 'BUYER':
            $upi_id = isset($data['upi_id']) ? $data['upi_id'] : '';
            $sql = "INSERT INTO buyer_profiles (user_id, upi_id) VALUES (?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("is", $user_id, $upi_id);
            $stmt->execute();
            break;

        case 'SELLER':
            $shop_name = isset($data['shop_name']) ? $data['shop_name'] : '';
            $seller_type = isset($data['seller_type']) ? $data['seller_type'] : 'INDIVIDUAL';
            $upi_id = isset($data['upi_id']) ? $data['upi_id'] : '';
            $sql = "INSERT INTO seller_profiles (user_id, shop_name, seller_type, upi_id) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("isss", $user_id, $shop_name, $seller_type, $upi_id);
            $stmt->execute();
            break;

        case 'DOCTOR':
            $qualification = isset($data['qualification']) ? $data['qualification'] : '';
            $specialization = isset($data['specialization']) ? $data['specialization'] : '';
            $hospital = isset($data['hospital']) ? $data['hospital'] : '';
            $languages = isset($data['languages']) ? $data['languages'] : '';
            $experience = isset($data['experience']) ? $data['experience'] : '';
            $upi_id = isset($data['upi_id']) ? $data['upi_id'] : '';
            $sql = "INSERT INTO doctor_profiles (user_id, qualification, specialization, hospital, languages, experience, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issssss", $user_id, $qualification, $specialization, $hospital, $languages, $experience, $upi_id);
            $stmt->execute();
            break;

        case 'SPA':
        case 'SPA_OWNER':
            $spa_name = isset($data['spa_name']) ? $data['spa_name'] : '';
            $upi_id = isset($data['upi_id']) ? $data['upi_id'] : '';
            $services_offered = isset($data['services_offered']) ? $data['services_offered'] : '';
            $sql = "INSERT INTO spa_profiles (user_id, spa_name, upi_id, services_offered) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("isss", $user_id, $spa_name, $upi_id, $services_offered);
            $stmt->execute();
            break;
    }
}

// ========================================
// FUNCTION: Change Password (Logged-in)
// ========================================
function changePassword()
{
    global $conn;

    $data = json_decode(file_get_contents('php://input'), true);

    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    $current_password = isset($data['current_password']) ? $data['current_password'] : '';
    $new_password = isset($data['new_password']) ? $data['new_password'] : '';

    if ($user_id <= 0 || empty($current_password) || empty($new_password)) {
        echo json_encode(['success' => false, 'message' => 'Required fields missing']);
        return;
    }

    try {
        // First verify current password
        $sql = "SELECT password_hash FROM users WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();

            if ($user['password_hash'] === $current_password) {
                // Current password matches, now update to new password
                $update_sql = "UPDATE users SET password_hash = ? WHERE user_id = ?";
                $update_stmt = $conn->prepare($update_sql);
                $update_stmt->bind_param("si", $new_password, $user_id);

                if ($update_stmt->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to update password']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}

?>