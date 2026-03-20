<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

require_once 'db.php';

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

switch ($action) {
    case 'add':
        addPetListing();
        break;
    case 'update':
        updatePetListing();
        break;
    case 'delete':
        deletePetListing();
        break;
    case 'list_personal':
        listPersonalPet();
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action. Use: add, update, delete, list_personal']);
        exit;
}

function listPersonalPet()
{
    global $host, $dbname, $username, $password;
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['user_pet_id']) || !isset($input['seller_id']) || !isset($input['price'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $user_pet_id = intval($input['user_pet_id']);
    $seller_id = intval($input['seller_id']);
    $price = floatval($input['price']);
    $description = $input['description'] ?? '';

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->beginTransaction();

        // 1. Get user pet data
        $stmt = $conn->prepare("SELECT * FROM user_pets WHERE pet_id = ? AND user_id = ?");
        $stmt->execute([$user_pet_id, $seller_id]);
        $userPet = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userPet) {
            echo json_encode(['success' => false, 'error' => 'User pet not found']);
            exit;
        }

        // 2. Insert into pets table
        $stmt = $conn->prepare("INSERT INTO pets (seller_id, pet_name, species, breed, age, gender, price, description, availability_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', NOW())");
        $ageInt = intval($userPet['age']);
        $stmt->execute([
            $seller_id,
            $userPet['pet_name'],
            $userPet['species'],
            $userPet['breed'],
            $ageInt,
            strtoupper($userPet['gender']),
            $price,
            $description ?: $userPet['description']
        ]);
        $new_pet_id = $conn->lastInsertId();

        // 3. Move existing image
        if ($userPet['image_url']) {
            $stmt = $conn->prepare("INSERT INTO pet_images (pet_id, image_url) VALUES (?, ?)");
            $stmt->execute([$new_pet_id, $userPet['image_url']]);
        }

        // 4. Move existing certificates
        $cert_cols = [
            'vaccination_cert' => 'VACCINATION',
            'health_cert' => 'HEALTH',
            'license_cert' => 'LICENSE'
        ];

        foreach ($cert_cols as $col => $type) {
            if (!empty($userPet[$col])) {
                $stmt = $conn->prepare("INSERT INTO certificates (pet_id, certificate_type, certificate_file, issued_date, created_at) VALUES (?, ?, ?, CURDATE(), NOW())");
                $stmt->execute([$new_pet_id, $type, $userPet[$col]]);
            }
        }

        // 5. Handle NEW certificates uploaded during this request
        $cert_dir = 'uploads/certificates/';
        if (!file_exists($cert_dir))
            mkdir($cert_dir, 0777, true);

        $new_certs = [
            'new_vaccination_cert' => 'VACCINATION',
            'new_health_cert' => 'HEALTH',
            'new_license_cert' => 'LICENSE'
        ];

        foreach ($new_certs as $input_key => $db_type) {
            if (isset($input[$input_key]) && !empty($input[$input_key])) {
                // If the user uploaded a new one even if one existed in user_pets, we can decide to keep both or replace.
                // For simplicity, let's just add it.
                $cert_name_key = $input_key . '_name';
                $cert_name = isset($input[$cert_name_key]) ? $input[$cert_name_key] : '';
                $ext = getExtensionFromFileName($cert_name) ?: getExtensionFromBase64($input[$input_key]);

                $cert_content = stripBase64Prefix($input[$input_key]);
                $cert_data = base64_decode($cert_content);
                $prefix = strtolower($db_type);
                $cert_filename = $prefix . '_cert_' . $new_pet_id . '_' . time() . '.' . $ext;
                file_put_contents($cert_dir . $cert_filename, $cert_data);

                $stmt = $conn->prepare("INSERT INTO certificates (pet_id, certificate_type, certificate_file, issued_date, created_at) VALUES (?, ?, ?, CURDATE(), NOW())");
                $stmt->execute([$new_pet_id, $db_type, 'uploads/certificates/' . $cert_filename]);
            }
        }

        // 6. Handle additional photos (since listings need at least 3)
        if (isset($input['additional_photos']) && is_array($input['additional_photos'])) {
            $upload_dir = 'uploads/pets/';
            if (!file_exists($upload_dir))
                mkdir($upload_dir, 0777, true);

            foreach ($input['additional_photos'] as $index => $base64_image) {
                $base64_image = stripBase64Prefix($base64_image);
                $image_data = base64_decode($base64_image);
                $filename = 'pet_ext_' . $new_pet_id . '_' . $index . '_' . time() . '.jpg';
                file_put_contents($upload_dir . $filename, $image_data);

                $image_url = 'uploads/pets/' . $filename;
                $stmt = $conn->prepare("INSERT INTO pet_images (pet_id, image_url) VALUES (?, ?)");
                $stmt->execute([$new_pet_id, $image_url]);
            }
        }

        // 7. Delete from user_pets as it is now a listing
        $stmt = $conn->prepare("DELETE FROM user_pets WHERE pet_id = ?");
        $stmt->execute([$user_pet_id]);

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Pet listed for sale successfully', 'pet_id' => intval($new_pet_id)]);

    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction())
            $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function addPetListing()
{
    global $host, $dbname, $username, $password;

    $input = json_decode(file_get_contents('php://input'), true);

    if (
        !isset($input['seller_id']) || !isset($input['pet_type']) || !isset($input['breed']) ||
        !isset($input['age']) || !isset($input['gender']) || !isset($input['price']) ||
        !isset($input['description']) || !isset($input['photos'])
    ) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $seller_id = intval($input['seller_id']);
    $pet_type = $input['pet_type'];
    $breed = $input['breed'];
    $age = $input['age'];
    $gender = strtoupper($input['gender']);
    $price = floatval($input['price']);
    $description = $input['description'];
    $photos = $input['photos'];

    // Certificate data and names
    $vaccination_cert = isset($input['vaccination_cert']) ? $input['vaccination_cert'] : null;
    $vaccination_name = isset($input['vaccination_cert_name']) ? $input['vaccination_cert_name'] : '';

    $health_cert = isset($input['health_cert']) ? $input['health_cert'] : null;
    $health_name = isset($input['health_cert_name']) ? $input['health_cert_name'] : '';

    $license_cert = isset($input['license_cert']) ? $input['license_cert'] : null;
    $license_name = isset($input['license_cert_name']) ? $input['license_cert_name'] : '';

    $pet_name = isset($input['pet_name']) ? $input['pet_name'] : $breed;
    $color = isset($input['color']) ? $input['color'] : '';

    if (!is_array($photos) || count($photos) < 3) {
        echo json_encode(['success' => false, 'error' => 'Minimum 3 photos required']);
        exit;
    }

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->beginTransaction();

        $stmt = $conn->prepare("INSERT INTO pets (seller_id, pet_name, species, breed, age, gender, color, price, description, availability_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', NOW())");
        $stmt->execute([$seller_id, $pet_name, $pet_type, $breed, intval($age), $gender, $color, $price, $description]);
        $pet_id = $conn->lastInsertId();

        $upload_dir = 'uploads/pets/';
        if (!file_exists($upload_dir))
            mkdir($upload_dir, 0777, true);

        foreach ($photos as $index => $base64_image) {
            $base64_image = stripBase64Prefix($base64_image);
            $image_data = base64_decode($base64_image);
            $filename = 'pet_' . $pet_id . '_' . $index . '_' . time() . '.jpg';
            file_put_contents($upload_dir . $filename, $image_data);

            $image_url = 'uploads/pets/' . $filename;

            $stmt = $conn->prepare("INSERT INTO pet_images (pet_id, image_url) VALUES (?, ?)");
            $stmt->execute([$pet_id, $image_url]);
        }

        $cert_dir = 'uploads/certificates/';
        if (!file_exists($cert_dir))
            mkdir($cert_dir, 0777, true);

        // Handle Vaccination Certificate
        if ($vaccination_cert) {
            $ext = getExtensionFromFileName($vaccination_name) ?: getExtensionFromBase64($vaccination_cert);
            $vaccination_cert = stripBase64Prefix($vaccination_cert);
            $cert_data = base64_decode($vaccination_cert);
            $cert_filename = 'vacc_cert_' . $pet_id . '_' . time() . '.' . $ext;
            file_put_contents($cert_dir . $cert_filename, $cert_data);

            $stmt = $conn->prepare("INSERT INTO certificates (pet_id, certificate_type, certificate_file, issued_date, created_at) VALUES (?, 'VACCINATION', ?, CURDATE(), NOW())");
            $stmt->execute([$pet_id, 'uploads/certificates/' . $cert_filename]);
        }

        // Handle Health Certificate
        if ($health_cert) {
            $ext = getExtensionFromFileName($health_name) ?: getExtensionFromBase64($health_cert);
            $health_cert = stripBase64Prefix($health_cert);
            $health_data = base64_decode($health_cert);
            $health_filename = 'health_cert_' . $pet_id . '_' . time() . '.' . $ext;
            file_put_contents($cert_dir . $health_filename, $health_data);
            $stmt = $conn->prepare("INSERT INTO certificates (pet_id, certificate_type, certificate_file, issued_date, created_at) VALUES (?, 'HEALTH', ?, CURDATE(), NOW())");
            $stmt->execute([$pet_id, 'uploads/certificates/' . $health_filename]);
        }

        // Handle License Certificate
        if ($license_cert) {
            $ext = getExtensionFromFileName($license_name) ?: getExtensionFromBase64($license_cert);
            $license_cert = stripBase64Prefix($license_cert);
            $license_data = base64_decode($license_cert);
            $license_filename = 'license_cert_' . $pet_id . '_' . time() . '.' . $ext;
            file_put_contents($cert_dir . $license_filename, $license_data);
            $stmt = $conn->prepare("INSERT INTO certificates (pet_id, certificate_type, certificate_file, issued_date, created_at) VALUES (?, 'LICENSE', ?, CURDATE(), NOW())");
            $stmt->execute([$pet_id, 'uploads/certificates/' . $license_filename]);
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Pet listing created successfully', 'listing_id' => intval($pet_id)]);

    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction())
            $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function updatePetListing()
{
    global $host, $dbname, $username, $password;

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['listing_id']) || !isset($input['seller_id'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $pet_id = intval($input['listing_id']);
    $seller_id = intval($input['seller_id']);

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("SELECT seller_id FROM pets WHERE pet_id = ?");
        $stmt->execute([$pet_id]);
        $listing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$listing || intval($listing['seller_id']) !== $seller_id) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized or listing not found']);
            exit;
        }

        // Check if pet is sold
        $stmtStatus = $conn->prepare("SELECT availability_status FROM pets WHERE pet_id = ?");
        $stmtStatus->execute([$pet_id]);
        $statusRow = $stmtStatus->fetch(PDO::FETCH_ASSOC);
        if ($statusRow && strtolower($statusRow['availability_status']) === 'sold') {
            echo json_encode(['success' => false, 'error' => 'Sold pets cannot be edited']);
            exit;
        }

        $conn->beginTransaction();

        // Update basic pet details
        $gender = isset($input['gender']) ? strtoupper($input['gender']) : null;

        $stmt = $conn->prepare("UPDATE pets SET species = ?, breed = ?, age = ?, gender = ?, price = ?, description = ? WHERE pet_id = ? AND seller_id = ?");
        $stmt->execute([
            $input['pet_type'] ?? null,
            $input['breed'] ?? null,
            intval($input['age'] ?? 0),
            $gender,
            floatval($input['price'] ?? 0),
            $input['description'] ?? '',
            $pet_id,
            $seller_id
        ]);

        // Handle deleted photos
        if (isset($input['deleted_photo_ids']) && is_array($input['deleted_photo_ids'])) {
            foreach ($input['deleted_photo_ids'] as $photo_id) {
                // Get file path before deleting record
                $stmt = $conn->prepare("SELECT image_url FROM pet_images WHERE image_id = ? AND pet_id = ?");
                $stmt->execute([intval($photo_id), $pet_id]);
                $photo = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($photo && !empty($photo['image_url'])) {
                    $file_path = $photo['image_url'];
                    if (file_exists($file_path)) {
                        unlink($file_path);
                    }
                }

                $stmt = $conn->prepare("DELETE FROM pet_images WHERE image_id = ? AND pet_id = ?");
                $stmt->execute([intval($photo_id), $pet_id]);
            }
        }

        // Handle new photos
        if (isset($input['new_photos']) && is_array($input['new_photos'])) {
            $upload_dir = 'uploads/pets/';
            if (!file_exists($upload_dir))
                mkdir($upload_dir, 0777, true);

            foreach ($input['new_photos'] as $index => $base64_image) {
                $base64_image = stripBase64Prefix($base64_image);
                $image_data = base64_decode($base64_image);
                $filename = 'pet_' . $pet_id . '_' . $index . '_' . time() . '.jpg';
                file_put_contents($upload_dir . $filename, $image_data);

                $image_url = 'uploads/pets/' . $filename;

                $stmt = $conn->prepare("INSERT INTO pet_images (pet_id, image_url) VALUES (?, ?)");
                $stmt->execute([$pet_id, $image_url]);
            }
        }

        // Handle certificate uploads (new or replacement)
        $cert_dir = 'uploads/certificates/';
        if (!file_exists($cert_dir))
            mkdir($cert_dir, 0777, true);

        $cert_types = [
            'vaccination_cert' => 'VACCINATION',
            'health_cert' => 'HEALTH',
            'license_cert' => 'LICENSE'
        ];

        foreach ($cert_types as $input_key => $db_type) {
            if (isset($input[$input_key]) && !empty($input[$input_key])) {
                // Delete old certificate file if exists
                $stmt = $conn->prepare("SELECT certificate_id, certificate_file FROM certificates WHERE pet_id = ? AND certificate_type = ?");
                $stmt->execute([$pet_id, $db_type]);
                $existing_cert = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($existing_cert) {
                    // Remove old file
                    $old_path = $existing_cert['certificate_file'];
                    if (file_exists($old_path)) {
                        unlink($old_path);
                    }
                    // Delete old record
                    $stmt = $conn->prepare("DELETE FROM certificates WHERE certificate_id = ?");
                    $stmt->execute([$existing_cert['certificate_id']]);
                }

                // Determine extension
                $cert_name_key = $input_key . '_name';
                $cert_name = isset($input[$cert_name_key]) ? $input[$cert_name_key] : '';
                $ext = getExtensionFromFileName($cert_name) ?: getExtensionFromBase64($input[$input_key]);

                // Save new certificate file
                $cert_content = stripBase64Prefix($input[$input_key]);
                $cert_data = base64_decode($cert_content);
                $prefix = strtolower($db_type);
                $cert_filename = $prefix . '_cert_' . $pet_id . '_' . time() . '.' . $ext;
                file_put_contents($cert_dir . $cert_filename, $cert_data);

                // Insert new record
                $stmt = $conn->prepare("INSERT INTO certificates (pet_id, certificate_type, certificate_file, issued_date, created_at) VALUES (?, ?, ?, CURDATE(), NOW())");
                $stmt->execute([$pet_id, $db_type, 'uploads/certificates/' . $cert_filename]);
            }
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Pet listing updated successfully']);

    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction())
            $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

function deletePetListing()
{
    global $host, $dbname, $username, $password;

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['listing_id']) || !isset($input['seller_id'])) {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }

    $pet_id = intval($input['listing_id']);
    $seller_id = intval($input['seller_id']);

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("SELECT seller_id FROM pets WHERE pet_id = ?");
        $stmt->execute([$pet_id]);
        $listing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$listing || intval($listing['seller_id']) !== $seller_id) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized or listing not found']);
            exit;
        }

        // Check if pet is sold
        $stmtStatus = $conn->prepare("SELECT availability_status FROM pets WHERE pet_id = ?");
        $stmtStatus->execute([$pet_id]);
        $statusRow = $stmtStatus->fetch(PDO::FETCH_ASSOC);
        if ($statusRow && strtolower($statusRow['availability_status']) === 'sold') {
            echo json_encode(['success' => false, 'error' => 'Sold pets cannot be deleted to preserve history']);
            exit;
        }

        $conn->beginTransaction();

        // Delete images from filesystem
        $stmt = $conn->prepare("SELECT image_url FROM pet_images WHERE pet_id = ?");
        $stmt->execute([$pet_id]);
        $photos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($photos as $photo) {
            $file_path = $photo['image_url'];
            if (file_exists($file_path))
                unlink($file_path);
        }

        // Delete image records
        $stmt = $conn->prepare("DELETE FROM pet_images WHERE pet_id = ?");
        $stmt->execute([$pet_id]);

        // Delete certificate files
        $stmt = $conn->prepare("SELECT certificate_file FROM certificates WHERE pet_id = ?");
        $stmt->execute([$pet_id]);
        $certificates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($certificates as $cert) {
            $file_path = $cert['certificate_file'];
            if (file_exists($file_path))
                unlink($file_path);
        }

        // Delete certificate records
        $stmt = $conn->prepare("DELETE FROM certificates WHERE pet_id = ?");
        $stmt->execute([$pet_id]);

        // Delete the pet listing
        $stmt = $conn->prepare("DELETE FROM pets WHERE pet_id = ? AND seller_id = ?");
        $stmt->execute([$pet_id, $seller_id]);

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Listing deleted successfully']);

    } catch (PDOException $e) {
        if (isset($conn) && $conn->inTransaction())
            $conn->rollBack();
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
}

// ============== Helper Functions ==============

function stripBase64Prefix($base64_string)
{
    if (preg_match('/^data:.*,/', $base64_string, $match)) {
        return substr($base64_string, strlen($match[0]));
    }
    return $base64_string;
}

function getExtensionFromBase64($base64_string)
{
    // Detect MIME type from data prefix if present
    if (preg_match('/^data:(.*?);/', $base64_string, $match)) {
        $mime = $match[1];
        if ($mime == 'application/pdf')
            return 'pdf';
        if ($mime == 'image/jpeg')
            return 'jpg';
        if ($mime == 'image/png')
            return 'png';
        if ($mime == 'image/gif')
            return 'gif';
    }

    // Otherwise detect from magic bytes
    $data = base64_decode(stripBase64Prefix($base64_string));
    if (!$data)
        return 'pdf'; // Default

    $f = finfo_open();
    $mime = finfo_buffer($f, $data, FILEINFO_MIME_TYPE);
    finfo_close($f);

    if ($mime == 'application/pdf')
        return 'pdf';
    if ($mime == 'image/jpeg')
        return 'jpg';
    if ($mime == 'image/png')
        return 'png';
    if ($mime == 'image/gif')
        return 'gif';

    return 'pdf'; // Default fallback
}

function getExtensionFromFileName($filename)
{
    if (!$filename)
        return null;
    $parts = explode('.', $filename);
    if (count($parts) > 1) {
        $ext = strtolower(end($parts));
        if (in_array($ext, ['pdf', 'jpg', 'jpeg', 'png', 'gif'])) {
            return $ext == 'jpeg' ? 'jpg' : $ext;
        }
    }
    return null;
}
?>