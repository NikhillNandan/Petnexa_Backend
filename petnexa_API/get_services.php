<?php
header('Content-Type: application/json');
require_once 'db.php';

// Get parameters
$provider_id = isset($_GET['provider_id']) ? intval($_GET['provider_id']) : 0;
$provider_type = isset($_GET['provider_type']) ? $_GET['provider_type'] : '';

// Validate inputs
if ($provider_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid provider ID'
    ]);
    exit;
}

if (!in_array($provider_type, ['doctor', 'spa'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid provider type. Must be doctor or spa'
    ]);
    exit;
}

try {
    if ($provider_type === 'spa') {
        // For Spas, services are in spa_services table. 
        // Attempt to resolve provider_id as user_id first
        $spa_id = 0;
        $stmt_resolve_user = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
        $stmt_resolve_user->bind_param("i", $provider_id);
        $stmt_resolve_user->execute();
        $res = $stmt_resolve_user->get_result()->fetch_assoc();
        
        if ($res) {
            $spa_id = $res['spa_id'];
        } else {
            // Fallback: Check if provider_id is already a valid spa_id
            $stmt_resolve_spa = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE spa_id = ?");
            $stmt_resolve_spa->bind_param("i", $provider_id);
            $stmt_resolve_spa->execute();
            if ($stmt_resolve_spa->get_result()->fetch_assoc()) {
                $spa_id = $provider_id;
            }
            $stmt_resolve_spa->close();
        }
        $stmt_resolve_user->close();

        if ($spa_id > 0) {
            // Include both 'duration' and 'duration_minutes' for app compatibility
            $stmt = $conn->prepare("SELECT service_id, service_name, description, duration_minutes as duration, duration_minutes, price FROM spa_services WHERE spa_id = ? AND (status IS NULL OR status != 'removed') ORDER BY service_name ASC");
            $stmt->bind_param("i", $spa_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $services = [];
            while ($row = $result->fetch_assoc()) {
                $services[] = [
                    'service_id' => $row['service_id'],
                    'service_name' => $row['service_name'],
                    'description' => $row['description'],
                    'duration' => $row['duration'],
                    'duration_minutes' => $row['duration_minutes'], // Explicitly add duration_minutes
                    'price' => $row['price']
                ];
            }
            echo json_encode([
                "success" => true, 
                "services" => $services,
                'count' => count($services)
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Spa profile not found", "services" => [], 'count' => 0]);
        }
        exit;
    } else {
        // Fetch services for doctor from general services table
        $stmt = $conn->prepare("
            SELECT 
                service_id,
                service_name,
                description,
                duration,
                price
            FROM services 
            WHERE provider_id = ? 
            AND provider_type = ? 
            AND (is_active = 1 OR is_active IS NULL)
            ORDER BY service_name ASC
        ");
        $stmt->bind_param("is", $provider_id, $provider_type);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $services = [];
    while ($row = $result->fetch_assoc()) {
        $services[] = [
            'service_id' => $row['service_id'],
            'service_name' => $row['service_name'],
            'description' => $row['description'],
            'duration' => $row['duration'],
            'price' => $row['price']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'services' => $services,
        'count' => count($services)
    ]);
    
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching services: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
