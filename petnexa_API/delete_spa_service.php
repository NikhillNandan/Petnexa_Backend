<?php
/**
 * delete_spa_service.php - Delete a spa service
 * Deploy to: htdocs/petnexa_API/delete_spa_service.php
 */

header('Content-Type: application/json');
require_once 'db.php';

$response = array();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    $service_id = isset($_POST['service_id']) ? intval($_POST['service_id']) : 0;
    
    if ($user_id <= 0 || $service_id <= 0) {
        $response['error'] = true;
        $response['message'] = 'User ID and service ID are required';
        echo json_encode($response);
        exit;
    }
    
    // Get spa_id
    $spa_query = $conn->prepare("SELECT spa_id FROM spa_profiles WHERE user_id = ?");
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
    
    // Soft delete: set status to 'removed'
    // This matches the fetch logic in get_spa_services.php and get_spa_details.php
    $stmt = $conn->prepare("UPDATE spa_services SET status = 'removed' WHERE service_id = ? AND spa_id = ?");
    $stmt->bind_param("ii", $service_id, $spa_id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Also get the service name to remove it from spa_profiles.services_offered
            $name_query = $conn->prepare("SELECT service_name FROM spa_services WHERE service_id = ?");
            $name_query->bind_param("i", $service_id);
            $name_query->execute();
            $name_res = $name_query->get_result();
            if ($name_row = $name_res->fetch_assoc()) {
                $service_name = $name_row['service_name'];
                
                // Get current services_offered string
                $profile_query = $conn->prepare("SELECT services_offered FROM spa_profiles WHERE spa_id = ?");
                $profile_query->bind_param("i", $spa_id);
                $profile_query->execute();
                $profile_res = $profile_query->get_result();
                if ($profile_row = $profile_res->fetch_assoc()) {
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
                        $upd_profile->bind_param("si", $new_offered, $spa_id);
                        $upd_profile->execute();
                        $upd_profile->close();
                    }
                }
                $profile_query->close();
            }
            $name_query->close();

            $response['error'] = false;
            $response['message'] = 'Service deleted successfully';
        } else {
            $response['error'] = true;
            $response['message'] = 'Service not found';
        }
    } else {
        $response['error'] = true;
        $response['message'] = 'Failed to delete service: ' . $stmt->error;
    }
    
    $stmt->close();
    
} else {
    $response['error'] = true;
    $response['message'] = 'Invalid request method. Use POST.';
}

echo json_encode($response);
$conn->close();
?>
