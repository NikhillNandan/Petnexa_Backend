<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

require_once 'db.php';
require_once 'send_fcm.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get input data (handle both JSON and form-data)
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$pet_id = isset($input['pet_id']) ? intval($input['pet_id']) : 0;
$doctor_id = isset($input['doctor_id']) ? intval($input['doctor_id']) : 0;
$appointment_id = isset($input['appointment_id']) ? intval($input['appointment_id']) : 0;
$certificate_type = isset($input['certificate_type']) ? $input['certificate_type'] : '';
$certificate_data = isset($input['certificate_data']) ? $input['certificate_data'] : ''; // Base64
$certificate_details = isset($input['certificate_details']) ? $input['certificate_details'] : ''; // Consolidated string from Android
$issued_date = isset($input['issued_date']) ? $input['issued_date'] : date('Y-m-d');
$validity_period = isset($input['validity_period']) ? $input['validity_period'] : '';

// Validation: If appointment_id is provided, we can fetch pet_id and doctor_id if they are 0
if ($appointment_id > 0 && ($pet_id == 0 || $doctor_id == 0)) {
    $stmt = $conn->prepare("SELECT pet_id, doctor_id FROM doctor_appointments WHERE appointment_id = ?");
    $stmt->bind_param("i", $appointment_id);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    if ($res) {
        $pet_id = $res['pet_id'];
        $doctor_id = $res['doctor_id'];
    }
}

if ($pet_id <= 0 || $doctor_id <= 0 || empty($certificate_type) || (empty($certificate_data) && empty($certificate_details))) {
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields (pet_id, doctor_id, type, data)'
    ]);
    exit;
}

// Handle Base64 file if provided
$file_path = '';
if (!empty($certificate_data)) {
    try {
        $upload_dir = '../uploads/certificates/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $extension = 'png'; // default
        if (strpos($certificate_data, 'JVBERi') === 0) $extension = 'pdf';
        
        $filename = 'cert_' . $pet_id . '_' . time() . '.' . $extension;
        $filepath = $upload_dir . $filename;
        
        // Remove header if present
        if (strpos($certificate_data, ',') !== false) {
            $certificate_data = explode(',', $certificate_data)[1];
        }
        
        $decodedData = base64_decode($certificate_data);
        if (file_put_contents($filepath, $decodedData)) {
            $file_path = 'uploads/certificates/' . $filename;
        }
    } catch (Exception $e) {
        // Log error but continue with details if record creation is possible
    }
}

// Calculate expiry date 
$expiry_date = null;
if (!empty($validity_period)) {
    if (preg_match('/(\d+)\s*(year|month)/i', $validity_period, $matches)) {
        $amount = intval($matches[1]);
        $unit = strtolower($matches[2]);
        $expiry_date = date('Y-m-d', strtotime($issued_date . ' +' . $amount . ' ' . $unit . 's'));
    }
}

// Map certificate type
$db_cert_type = 'HEALTH';
if (stripos($certificate_type, 'vaccination') !== false) $db_cert_type = 'VACCINATION';
elseif (stripos($certificate_type, 'rabies') !== false) $db_cert_type = 'VACCINATION';
elseif (stripos($certificate_type, 'license') !== false) $db_cert_type = 'LICENSE';

try {
    // Insert certificate
    $stmt = $conn->prepare("
        INSERT INTO certificates 
        (pet_id, issued_by, certificate_type, certificate_file, issued_date, expiry_date, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $notes = $certificate_details ?: "Type: $certificate_type";
    if ($appointment_id > 0) $notes .= "\nAppointment ID: $appointment_id";
    
    $stmt->bind_param("iisssss", $pet_id, $doctor_id, $db_cert_type, $file_path, $issued_date, $expiry_date, $notes);
    $stmt->execute();
    $certificate_id = $conn->insert_id;
    
    // CRITICAL: Update Appointment status to COMPLETED
    if ($appointment_id > 0) {
        $update = $conn->prepare("UPDATE doctor_appointments SET consultation_status = 'COMPLETED' WHERE appointment_id = ?");
        $update->bind_param("i", $appointment_id);
        $update->execute();
        
        // Notify buyer
        $buyerStmt = $conn->prepare("SELECT user_id FROM doctor_appointments WHERE appointment_id = ?");
        $buyerStmt->bind_param("i", $appointment_id);
        $buyerStmt->execute();
        $buyer = $buyerStmt->get_result()->fetch_assoc();
        if ($buyer) {
            sendFCMNotification(
                $buyer['user_id'],
                'Appointment Completed!',
                'Your doctor has issued a certificate. You can now download it and review the service.',
                'appointment_completed',
                $appointment_id
            );
        }
    }
    
    echo json_encode([
        'success' => true,
        'certificate_id' => $certificate_id,
        'message' => 'Certificate issued and appointment completed'
    ]);
    
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => 'DB error: ' . $e->getMessage()]);
}
?>
