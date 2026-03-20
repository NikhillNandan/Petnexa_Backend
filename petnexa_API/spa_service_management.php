<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once 'db.php';

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

switch ($action) {
    case 'add_service':
    case 'add':
        addSpaService();
        break;
    case 'update_service':
    case 'update':
        updateSpaService();
        break;
    case 'delete_service':
    case 'delete':
        deleteSpaService();
        break;
    case 'get_services':
    case 'get':
        getSpaServices();
        break;
    case 'get_booked_slots':
        getSpaBookedSlots();
        break;
    default:
        echo json_encode(['error' => true, 'message' => 'Invalid action. Use: add_service, update_service, delete_service, get_services, get_booked_slots']);
        exit;
}

function addSpaService()
{
    global $host, $dbname, $username, $password;

    // Support both form-encoded POST and JSON body
    $service_name = isset($_POST['service_name']) ? $_POST['service_name'] : null;
    $price = isset($_POST['price']) ? floatval($_POST['price']) : null;
    $duration = isset($_POST['duration_minutes']) ? intval($_POST['duration_minutes']) : (isset($_POST['duration']) ? intval($_POST['duration']) : null);
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : (isset($_POST['spa_id']) ? intval($_POST['spa_id']) : 0);
    $description = isset($_POST['description']) ? $_POST['description'] : '';

    // Fallback to JSON body if POST params not found
    if ($service_name === null) {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $service_name = isset($input['service_name']) ? $input['service_name'] : null;
            $price = isset($input['price']) ? floatval($input['price']) : null;
            $duration = isset($input['duration_minutes']) ? intval($input['duration_minutes']) : (isset($input['duration']) ? intval($input['duration']) : null);
            $user_id = isset($input['user_id']) ? intval($input['user_id']) : (isset($input['spa_id']) ? intval($input['spa_id']) : 0);
            $description = isset($input['description']) ? $input['description'] : '';
        }
    }

    if (!$service_name || $price === null || $duration === null || $user_id <= 0) {
        echo json_encode(['error' => true, 'message' => 'Missing required fields: service_name, price, duration_minutes, user_id']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Resolve user_id -> spa_profiles.spa_id
        $spa_id = $user_id;
        $resolve = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
        $resolve->execute([$user_id]);
        $profile = $resolve->fetch(PDO::FETCH_ASSOC);
        if ($profile)
            $spa_id = intval($profile['spa_id']);

        $stmt = $conn->prepare("INSERT INTO spa_services (spa_id, service_name, price, duration_minutes, description) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$spa_id, $service_name, $price, $duration, $description]);

        echo json_encode(['error' => false, 'message' => 'Service added successfully', 'service_id' => $conn->lastInsertId()]);

    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function updateSpaService()
{
    global $host, $dbname, $username, $password;

    // Support both form-encoded POST and JSON body
    $service_id = isset($_POST['service_id']) ? intval($_POST['service_id']) : 0;
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : (isset($_POST['spa_id']) ? intval($_POST['spa_id']) : 0);
    $service_name = isset($_POST['service_name']) ? $_POST['service_name'] : null;
    $price = isset($_POST['price']) ? $_POST['price'] : null;
    $duration = isset($_POST['duration_minutes']) ? $_POST['duration_minutes'] : (isset($_POST['duration']) ? $_POST['duration'] : null);
    $description = isset($_POST['description']) ? $_POST['description'] : '';

    // Fallback to JSON body
    if ($service_id <= 0) {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $service_id = isset($input['service_id']) ? intval($input['service_id']) : 0;
            $user_id = isset($input['user_id']) ? intval($input['user_id']) : (isset($input['spa_id']) ? intval($input['spa_id']) : 0);
            $service_name = isset($input['service_name']) ? $input['service_name'] : null;
            $price = isset($input['price']) ? $input['price'] : null;
            $duration = isset($input['duration_minutes']) ? $input['duration_minutes'] : (isset($input['duration']) ? $input['duration'] : null);
            $description = isset($input['description']) ? $input['description'] : '';
        }
    }

    if ($service_id <= 0 || $user_id <= 0) {
        echo json_encode(['error' => true, 'message' => 'Missing required fields: service_id, user_id']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Resolve user_id -> spa_profiles.spa_id
        $spa_id = $user_id;
        $resolve = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
        $resolve->execute([$user_id]);
        $profile = $resolve->fetch(PDO::FETCH_ASSOC);
        if ($profile)
            $spa_id = intval($profile['spa_id']);

        $stmt = $conn->prepare("UPDATE spa_services SET service_name = ?, price = ?, duration_minutes = ?, description = ? WHERE service_id = ? AND spa_id = ?");
        $stmt->execute([$service_name, $price, $duration, $description, $service_id, $spa_id]);

        echo json_encode(['error' => false, 'message' => 'Service updated successfully']);

    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function deleteSpaService()
{
    global $host, $dbname, $username, $password;

    // Support both form-encoded POST and JSON body
    $service_id = isset($_POST['service_id']) ? intval($_POST['service_id']) : 0;
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : (isset($_POST['spa_id']) ? intval($_POST['spa_id']) : 0);

    // Fallback to JSON body
    if ($service_id <= 0) {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $service_id = isset($input['service_id']) ? intval($input['service_id']) : 0;
            $user_id = isset($input['user_id']) ? intval($input['user_id']) : (isset($input['spa_id']) ? intval($input['spa_id']) : 0);
        }
    }

    if ($service_id <= 0 || $user_id <= 0) {
        echo json_encode(['error' => true, 'message' => 'Missing required fields: service_id, user_id']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Resolve user_id -> spa_profiles.spa_id
        $spa_id = $user_id;
        $resolve = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
        $resolve->execute([$user_id]);
        $profile = $resolve->fetch(PDO::FETCH_ASSOC);
        if ($profile)
            $spa_id = intval($profile['spa_id']);

        // Soft delete: set status to 'removed'
        $stmt = $conn->prepare("UPDATE spa_services SET status = 'removed' WHERE service_id = ? AND spa_id = ?");
        $stmt->execute([$service_id, $spa_id]);

        // Also get the service name to remove it from spa_profiles.services_offered
        $name_query = $conn->prepare("SELECT service_name FROM spa_services WHERE service_id = ?");
        $name_query->execute([$service_id]);
        $name_row = $name_query->fetch(PDO::FETCH_ASSOC);
        if ($name_row) {
            $service_name = $name_row['service_name'];
            
            // Get current services_offered string
            $profile_query = $conn->prepare("SELECT services_offered FROM spa_profiles WHERE spa_id = ?");
            $profile_query->execute([$spa_id]);
            $profile_row = $profile_query->fetch(PDO::FETCH_ASSOC);
            if ($profile_row) {
                $offered = $profile_row['services_offered'];
                if (!empty($offered)) {
                    $list = explode(',', $offered);
                    $list = array_filter(array_map('trim', $list));
                    
                    // Filter out the service name (case-insensitive)
                    $new_list = array_filter($list, function($item) use ($service_name) {
                        return strcasecmp(trim($item), trim($service_name)) !== 0;
                    });
                    
                    $new_offered = implode(', ', $new_list);
                    
                    // Update profile
                    $upd_profile = $conn->prepare("UPDATE spa_profiles SET services_offered = ? WHERE spa_id = ?");
                    $upd_profile->execute([$new_offered, $spa_id]);
                }
            }
        }

        echo json_encode(['error' => false, 'message' => 'Service deleted successfully']);

    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function getSpaServices()
{
    global $host, $dbname, $username, $password;

    $param_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($_GET['spa_id']) ? intval($_GET['spa_id']) : 0);

    if ($param_id <= 0) {
        echo json_encode(array('error' => true, 'message' => 'Valid user_id or spa_id is required'));
        return;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Attempt to resolve spa_id if user_id was passed
        $spa_id = $param_id;
        $resolve = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
        $resolve->execute([$param_id]);
        $profile_row = $resolve->fetch(PDO::FETCH_ASSOC);
        if ($profile_row) {
            $spa_id = intval($profile_row['spa_id']);
        }

        // Ensure status column exists
        try {
            $conn->exec("ALTER TABLE spa_services ADD COLUMN status VARCHAR(20) DEFAULT 'active'");
        } catch (PDOException $e) { /* Already exists */ }

        $stmt = $conn->prepare("SELECT service_id, service_name, price, duration_minutes, description, status FROM spa_services WHERE spa_id = ? AND (status IS NULL OR status != 'removed') ORDER BY service_name");
        $stmt->execute([$spa_id]);
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Always ensure any service from spa_profiles.services_offered is in spa_services table
        $profile_query = $conn->prepare("SELECT services_offered FROM spa_profiles WHERE spa_id = ?");
        $profile_query->execute([$spa_id]);
        $profile_row = $profile_query->fetch(PDO::FETCH_ASSOC);

        if ($profile_row && !empty($profile_row['services_offered'])) {
            $offered_list = explode(',', $profile_row['services_offered']);
            $offered_list = array_filter(array_map('trim', $offered_list));

            if (!empty($offered_list)) {
                $stmt_insert = $conn->prepare("INSERT INTO spa_services (spa_id, service_name, price, duration_minutes, description) VALUES (?, ?, ?, ?, ?)");
                $default_price = 0.0;
                $default_duration = 30;
                $default_desc = 'Default service added from profile selection';
                $did_insert = false;

                // Get all services including removed to prevent re-insertion
                $stmt_all = $conn->prepare("SELECT service_name, status FROM spa_services WHERE spa_id = ?");
                $stmt_all->execute([$spa_id]);
                $services_all_cached = $stmt_all->fetchAll(PDO::FETCH_ASSOC);

                foreach ($offered_list as $s_name) {
                    // Case-insensitive check for existence (including removed)
                    $found = false;
                    $isRemoved = false;
                    foreach ($services_all_cached as $ext) {
                        if (strcasecmp($ext['service_name'], $s_name) === 0) {
                            $found = true;
                            if ($ext['status'] === 'removed') {
                                $isRemoved = true;
                            }
                            break;
                        }
                    }

                    if (!empty($s_name) && !$found) {
                        $stmt_insert->execute([$spa_id, $s_name, $default_price, $default_duration, $default_desc]);
                        $did_insert = true;
                    } else if ($isRemoved) {
                        // Re-activate if it's in offered list but was marked removed
                        $upd = $conn->prepare("UPDATE spa_services SET status = 'active' WHERE spa_id = ? AND service_name = ?");
                        $upd->execute([$spa_id, $s_name]);
                        $did_insert = true;
                    }
                }

                if ($did_insert) {
                    // Re-query after adding missing services
                    $stmt->execute([$spa_id]);
                    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
            }
        }

        $formatted_services = array_map(function ($service) use ($spa_id) {
            return [
                'id' => intval($service['service_id']),
                'service_name' => $service['service_name'],
                'price' => floatval($service['price']),
                'duration_minutes' => intval($service['duration_minutes']),
                'description' => $service['description'],
                'status' => 'Active',
                'spa_owner_id' => $spa_id
            ];
        }, $services);

        echo json_encode(['error' => false, 'services' => $formatted_services]);

    } catch (PDOException $e) {
        echo json_encode(['error' => true, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function getSpaBookedSlots()
{
    global $host, $dbname, $username, $password;

    $spa_owner_id = isset($_GET['spa_owner_id']) ? intval($_GET['spa_owner_id']) : 0;
    $date = isset($_GET['date']) ? $_GET['date'] : '';

    if ($spa_owner_id <= 0 || empty($date)) {
        echo json_encode(['status' => 'success', 'booked_slots' => []]);
        return;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Resolve user_id -> spa_profiles.spa_id
        $spa_id = $spa_owner_id;
        $resolve = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
        $resolve->execute([$spa_owner_id]);
        $profile = $resolve->fetch(PDO::FETCH_ASSOC);
        if ($profile)
            $spa_id = intval($profile['spa_id']);

        $stmt = $conn->prepare(
            "SELECT booking_time FROM spa_bookings 
             WHERE spa_id = ? 
             AND DATE(booking_date) = ?
             AND booking_status IN ('BOOKED', 'CONFIRMED', 'IN_PROGRESS')"
        );
        $stmt->execute([$spa_id, $date]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $bookedSlots = [];
        foreach ($rows as $row) {
            if (!empty($row['booking_time'])) {
                // Convert HH:mm:ss to hh:mm AM/PM to match Android slot format
                $ts = strtotime($row['booking_time']);
                if ($ts !== false) {
                    $bookedSlots[] = date('h:i A', $ts);
                }
            }
        }

        echo json_encode(['status' => 'success', 'booked_slots' => $bookedSlots]);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

?>