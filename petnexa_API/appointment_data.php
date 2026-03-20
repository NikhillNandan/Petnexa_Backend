<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once 'db.php';

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

switch ($action) {
    case 'get_details':
        getAppointmentDetails();
        break;
    case 'get_requests':
        getAppointmentRequests();
        break;
    case 'get_all':
        getAllAppointments();
        break;
    case 'get_today':
        getTodayAppointments();
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action. Use: get_details, get_requests, get_all, get_today']);
        exit;
}

function getAppointmentDetails()
{
    global $host, $dbname, $username, $password;

    $appointment_id = isset($_REQUEST['appointment_id']) ? intval($_REQUEST['appointment_id']) : 0;
    $type = isset($_REQUEST['type']) ? $_REQUEST['type'] : 'doctor';

    if ($appointment_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        if ($type === 'spa' || $type === 'Spa Service') {
            // Query for Spa Booking
            $sql = "SELECT sb.booking_id as appointment_id, sb.booking_date as appointment_date, sb.booking_time, 
                           ss.service_name as booked_service, sb.booking_status as status, 
                           sb.total_amount as base_amount, 0 as treatment_charge, 
                           'SUCCESS' as payment_status, 'UPI' as payment_method, 
                           0 as extra_paid_amount, 'PENDING' as extra_payment_status,
                           sb.pet_id, sb.pet_source,
                           COALESCE(p.pet_name, up.pet_name) as pet_name, 
                           COALESCE(p.breed, up.breed) as breed, 
                           COALESCE(p.species, up.species) as species, 
                           COALESCE(p.gender, up.gender) as gender,
                           u.user_id AS owner_id, u.full_name AS owner_name, u.phone AS owner_phone, u.email AS owner_email,
                           sp.spa_name as provider_name
                    FROM spa_bookings sb
                    INNER JOIN spa_services ss ON sb.service_id = ss.service_id
                    INNER JOIN users u ON sb.user_id = u.user_id
                    LEFT JOIN spa_profiles sp ON sb.spa_id = sp.spa_id
                    LEFT JOIN pets p ON sb.pet_id = p.pet_id AND (sb.pet_source IS NULL OR sb.pet_source != 'manual')
                    LEFT JOIN user_pets up ON sb.pet_id = up.pet_id AND sb.pet_source = 'manual'
                    WHERE sb.booking_id = ? LIMIT 1";
        } else {
            // Query for Doctor Appointment
            $sql = "SELECT da.appointment_id, da.appointment_date, da.booking_time, 
                           da.service_name AS booked_service, da.consultation_status as status, 
                           da.treatment_notes, da.treatment_charge, da.base_amount, 
                           da.payment_method, da.payment_status, da.extra_paid_amount, 
                           da.extra_payment_status, da.pet_id, da.pet_source,
                           dp.upi_id AS doctor_upi, 
                           COALESCE(p.pet_name, up.pet_name) as pet_name, 
                           COALESCE(p.breed, up.breed) as breed, 
                           COALESCE(p.age, up.age) as age, 
                           COALESCE(p.species, up.species) as species, 
                           COALESCE(p.gender, up.gender) as gender, 
                           u.user_id AS owner_id, u.full_name AS owner_name, u.phone AS owner_phone, u.email AS owner_email,
                           du.full_name as provider_name
                    FROM doctor_appointments da 
                    INNER JOIN users u ON da.user_id = u.user_id 
                    INNER JOIN users du ON da.doctor_id = du.user_id
                    LEFT JOIN doctor_profiles dp ON da.doctor_id = dp.user_id
                    LEFT JOIN pets p ON da.pet_id = p.pet_id AND (da.pet_source IS NULL OR da.pet_source != 'manual')
                    LEFT JOIN user_pets up ON da.pet_id = up.pet_id AND da.pet_source = 'manual'
                    WHERE da.appointment_id = ? LIMIT 1";
        }

        $stmt = $conn->prepare($sql);
        $stmt->execute([$appointment_id]);
        $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$appointment) {
            echo json_encode(['success' => false, 'error' => ucfirst($type) . ' not found']);
            exit;
        }

        $date = date('M d, Y', strtotime($appointment['appointment_date']));
        $time = $appointment['booking_time'] ?: date('h:i A', strtotime($appointment['appointment_date']));
        $age_val = isset($appointment['age']) ? $appointment['age'] : '';
        $age_text = !empty($age_val) ? $age_val . ' months' : 'Unknown';

        $service_name = $appointment['booked_service'] ?: 'Service';
        $base_amount = floatval($appointment['base_amount'] ?: 0);
        $extra_charges = floatval($appointment['treatment_charge'] ?: 0);
        $total_amount = $base_amount + $extra_charges;

        // Fetch certificate URL if available
        $certificate_url = '';
        if ($type !== 'spa' && $type !== 'Spa Service') {
            $certStmt = $conn->prepare("SELECT certificate_file FROM certificates WHERE notes LIKE ? OR pet_id = ? ORDER BY certificate_id DESC LIMIT 1");
            $certStmt->execute(['%Appointment ID: ' . $appointment_id . '%', $appointment['pet_id']]);
            $cert = $certStmt->fetch(PDO::FETCH_ASSOC);
            $certificate_url = $cert && !empty($cert['certificate_file']) ? $cert['certificate_file'] : '';
        }

        $formatted_appointment = [
            'appointment_id' => intval($appointment['appointment_id']),
            'pet_id' => intval($appointment['pet_id'] ?: 0),
            'pet_name' => $appointment['pet_name'] ?: 'No Pet Specified',
            'breed' => $appointment['breed'] ?: 'Unknown',
            'age' => $age_text,
            'species' => $appointment['species'] ?: 'Unknown',
            'gender' => $appointment['gender'] ?: 'Unknown',
            'owner_id' => intval($appointment['owner_id']),
            'owner_name' => $appointment['owner_name'],
            'owner_phone' => $appointment['owner_phone'],
            'owner_email' => $appointment['owner_email'],
            'appointment_date' => $date,
            'appointment_time' => $time,
            'service_name' => $service_name,
            'base_amount' => $base_amount,
            'extra_charges' => $extra_charges,
            'total_amount' => $total_amount,
            'payment_method' => $appointment['payment_method'] ?? 'CASH',
            'payment_status' => $appointment['payment_status'] ?? 'PENDING',
            'extra_paid_amount' => floatval($appointment['extra_paid_amount'] ?? 0),
            'extra_payment_status' => $appointment['extra_payment_status'] ?: 'PENDING',
            'treatment_notes' => $appointment['treatment_notes'] ?? '',
            'doctor_upi' => $appointment['doctor_upi'] ?? '',
            'status' => $appointment['status'],
            'certificate_url' => $certificate_url,
            'provider_name' => $appointment['provider_name'] ?? 'Provider'
        ];

        echo json_encode(['success' => true, 'appointment' => $formatted_appointment]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function getAppointmentRequests()
{
    global $host, $dbname, $username, $password;

    $doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : (isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($_REQUEST['user_id']) ? intval($_REQUEST['user_id']) : 0));

    if ($doctor_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid doctor ID']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("SELECT da.appointment_id, da.appointment_date, da.booking_time, da.service_name AS booked_service, da.consultation_status, da.treatment_charge, da.base_amount, da.pet_source, da.payment_method, COALESCE(p.pet_name, up.pet_name) as pet_name, COALESCE(p.breed, up.breed) as breed, COALESCE(p.age, up.age) as age, COALESCE(p.species, up.species) as species, u.full_name AS owner_name, u.phone AS owner_phone FROM doctor_appointments da LEFT JOIN pets p ON da.pet_id = p.pet_id AND (da.pet_source IS NULL OR da.pet_source != 'manual') LEFT JOIN user_pets up ON da.pet_id = up.pet_id AND da.pet_source = 'manual' INNER JOIN users u ON da.user_id = u.user_id WHERE da.doctor_id = ? AND da.consultation_status IN ('BOOKED', 'PENDING') ORDER BY da.appointment_date ASC");

        $stmt->execute([$doctor_id]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted_appointments = array_map(function ($apt) {
            $age_text = $apt['age'] ? $apt['age'] . ' months' : 'N/A';
            return [
                'appointment_id' => intval($apt['appointment_id']),
                'pet_name' => $apt['pet_name'] ?: 'No Pet Specified',
                'breed' => $apt['breed'] ?: 'Unknown',
                'age' => $age_text,
                'species' => $apt['species'] ?: 'Unknown',
                'owner_name' => $apt['owner_name'],
                'owner_phone' => $apt['owner_phone'],
                'appointment_date' => date('M d, Y', strtotime($apt['appointment_date'])),
                'appointment_time' => $apt['booking_time'] ?: date('h:i A', strtotime($apt['appointment_date'])),
                'service_name' => $apt['booked_service'] ?: 'General Consultation',
                'service_price' => floatval($apt['base_amount'] ?: 0),
                'total_amount' => floatval($apt['base_amount'] ?: 0) + floatval($apt['treatment_charge'] ?: 0),
                'status' => $apt['consultation_status'],
                'payment_method' => $apt['payment_method'] ?? 'CASH'
            ];
        }, $appointments);

        echo json_encode(['success' => true, 'appointments' => $formatted_appointments, 'total_count' => count($formatted_appointments)]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function getTodayAppointments()
{
    global $host, $dbname, $username, $password;

    $doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : (isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($_REQUEST['user_id']) ? intval($_REQUEST['user_id']) : 0));

    if ($doctor_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid doctor ID']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("SELECT da.appointment_id, da.appointment_date, da.booking_time, da.service_name, da.consultation_status, da.pet_source, COALESCE(p.pet_name, up.pet_name) as pet_name, COALESCE(p.breed, up.breed) as breed, COALESCE(p.species, up.species) as species, u.full_name AS owner_name, u.phone AS owner_phone FROM doctor_appointments da LEFT JOIN pets p ON da.pet_id = p.pet_id AND (da.pet_source IS NULL OR da.pet_source != 'manual') LEFT JOIN user_pets up ON da.pet_id = up.pet_id AND da.pet_source = 'manual' INNER JOIN users u ON da.user_id = u.user_id WHERE da.doctor_id = ? AND DATE(da.appointment_date) = CURDATE() ORDER BY da.appointment_date ASC");

        $stmt->execute([$doctor_id]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted_appointments = array_map(function ($apt) {
            return [
                'appointment_id' => intval($apt['appointment_id']),
                'pet_name' => $apt['pet_name'] ?: 'No Pet Specified',
                'breed' => $apt['breed'] ?: 'Unknown',
                'species' => $apt['species'] ?: 'Unknown',
                'owner_name' => $apt['owner_name'],
                'owner_phone' => $apt['owner_phone'],
                'appointment_date' => date('M d, Y', strtotime($apt['appointment_date'])),
                'appointment_time' => $apt['booking_time'] ?: date('h:i A', strtotime($apt['appointment_date'])),
                'service_name' => $apt['service_name'] ?: 'General Consultation',
                'status' => $apt['consultation_status']
            ];
        }, $appointments);

        echo json_encode(['success' => true, 'appointments' => $formatted_appointments, 'total_count' => count($formatted_appointments)]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function getAllAppointments()
{
    global $host, $dbname, $username, $password;

    // Fallback support for user_id
    $doctor_id = isset($_GET['doctor_id']) ? intval($_GET['doctor_id']) : (isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($_REQUEST['user_id']) ? intval($_REQUEST['user_id']) : 0));

    if ($doctor_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid doctor ID']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("SELECT da.appointment_id, da.appointment_date, da.booking_time, da.service_name AS booked_service, da.consultation_status, da.treatment_charge, da.base_amount, da.pet_source, da.payment_method, COALESCE(p.pet_name, up.pet_name) as pet_name, COALESCE(p.breed, up.breed) as breed, COALESCE(p.age, up.age) as age, COALESCE(p.species, up.species) as species, u.full_name AS owner_name, u.phone AS owner_phone FROM doctor_appointments da LEFT JOIN pets p ON da.pet_id = p.pet_id AND (da.pet_source IS NULL OR da.pet_source != 'manual') LEFT JOIN user_pets up ON da.pet_id = up.pet_id AND da.pet_source = 'manual' INNER JOIN users u ON da.user_id = u.user_id WHERE da.doctor_id = ? ORDER BY da.appointment_date DESC");

        $stmt->execute([$doctor_id]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted_appointments = array_map(function ($apt) {
            $age_text = $apt['age'] ? $apt['age'] . ' months' : 'N/A';
            return [
                'appointment_id' => intval($apt['appointment_id']),
                'pet_name' => $apt['pet_name'] ?: 'No Pet Specified',
                'breed' => $apt['breed'] ?: 'Unknown',
                'age' => $age_text,
                'species' => $apt['species'] ?: 'Unknown',
                'owner_name' => $apt['owner_name'],
                'owner_phone' => $apt['owner_phone'],
                'appointment_date' => date('M d, Y', strtotime($apt['appointment_date'])),
                'appointment_time' => $apt['booking_time'] ?: date('h:i A', strtotime($apt['appointment_date'])),
                'service_name' => $apt['booked_service'] ?: 'General Consultation',
                'service_price' => floatval($apt['base_amount'] ?: 0),
                'total_amount' => floatval($apt['base_amount'] ?: 0) + floatval($apt['treatment_charge'] ?: 0),
                'status' => $apt['consultation_status'],
                'payment_method' => $apt['payment_method'] ?? 'CASH'
            ];
        }, $appointments);

        echo json_encode(['success' => true, 'appointments' => $formatted_appointments, 'total_count' => count($formatted_appointments)]);

    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>