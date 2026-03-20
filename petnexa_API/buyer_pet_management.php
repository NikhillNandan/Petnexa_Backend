<?php
/**
 * buyer_pet_management.php
 * Manages buyer's manually-added pets (not purchased through app)
 * Using PDO for consistency and better error handling.
 */

header('Content-Type: application/json');
require_once 'db.php';

// Global connection parameters (from db.php)
global $host, $dbname, $username, $password;

$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Defensive Table Management: Avoid SQLSTATE[42S01] errors
    $tableExists = false;
    try {
        $stmt = $conn->query("SHOW TABLES LIKE 'user_pets'");
        $tableExists = ($stmt && $stmt->rowCount() > 0);
    } catch (Exception $e) {
        $tableExists = false;
    }

    if (!$tableExists) {
        try {
            // Check for legacy table
            $hasLegacy = false;
            try {
                $legStmt = $conn->query("SHOW TABLES LIKE 'buyer_pets'");
                $hasLegacy = ($legStmt && $legStmt->rowCount() > 0);
            } catch (Exception $e) {
                $hasLegacy = false;
            }

            if ($hasLegacy) {
                try {
                    $conn->query("RENAME TABLE buyer_pets TO user_pets");
                    $tableExists = true;
                } catch (Exception $e) {
                }
            }

            if (!$tableExists) {
                $conn->query("CREATE TABLE IF NOT EXISTS user_pets (
                    pet_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    pet_name VARCHAR(100) NOT NULL,
                    species VARCHAR(50) DEFAULT '',
                    breed VARCHAR(100) DEFAULT '',
                    age VARCHAR(50) DEFAULT '',
                    gender VARCHAR(20) DEFAULT '',
                    description TEXT,
                    image_url VARCHAR(255),
                    vaccination_cert VARCHAR(255),
                    health_cert VARCHAR(255),
                    license_cert VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                )");
                $tableExists = true;
            }
        } catch (PDOException $e) {
            $stmt = $conn->query("SHOW TABLES LIKE 'user_pets'");
            if (!$stmt || $stmt->rowCount() == 0) throw $e;
        }
    }

    // Ensure all columns exist in user_pets (migration for old schemas)
    if ($tableExists) {
        $required_columns = [
            'species' => "VARCHAR(50) DEFAULT ''",
            'breed' => "VARCHAR(100) DEFAULT ''",
            'age' => "VARCHAR(50) DEFAULT ''",
            'gender' => "VARCHAR(20) DEFAULT ''",
            'description' => "TEXT",
            'image_url' => "VARCHAR(255)",
            'vaccination_cert' => "VARCHAR(255)",
            'health_cert' => "VARCHAR(255)",
            'license_cert' => "VARCHAR(255)"
        ];

        foreach ($required_columns as $col => $definition) {
            try {
                $conn->query("SELECT $col FROM user_pets LIMIT 1");
            } catch (Exception $e) {
                try {
                    $conn->query("ALTER TABLE user_pets ADD COLUMN $col $definition");
                } catch (Exception $e2) {
                    error_log("Failed to add column $col: " . $e2->getMessage());
                }
            }
        }

        // Also ensure user_pet_images exists
        $conn->query("CREATE TABLE IF NOT EXISTS user_pet_images (
            image_id INT AUTO_INCREMENT PRIMARY KEY,
            pet_id INT NOT NULL,
            image_url VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pet_id) REFERENCES user_pets(pet_id) ON DELETE CASCADE
        )");
    }

    switch ($action) {
        case 'add':
            handleAddPet($conn);
            break;
        case 'delete':
            handleDeletePet($conn);
            break;
        default:
            echo json_encode(["success" => false, "result" => "Invalid action"]);
            break;
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Database Connection Error: " . $e->getMessage()]);
}

function handleAddPet($conn)
{
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        echo json_encode(["success" => false, "error" => "Invalid JSON data received"]);
        return;
    }

    $userId = isset($data['user_id']) ? intval($data['user_id']) : (isset($data['buyer_id']) ? intval($data['buyer_id']) : 0);
    $petName = $data['pet_name'] ?? '';
    $species = $data['species'] ?? '';
    $breed = $data['breed'] ?? '';
    $age = $data['age'] ?? '';
    $gender = $data['gender'] ?? '';
    $description = $data['description'] ?? '';

    if ($userId <= 0 || empty($petName)) {
        echo json_encode(["success" => false, "error" => "User ID and pet name are required"]);
        return;
    }

    try {
        $conn->beginTransaction();

        $photo_url = null;
        if (!empty($data['photo'])) {
            $photo_url = saveBase64File($data['photo'], 'uploads/user_pets/pet_' . $userId . '_' . time(), 'jpg');
        }

        $vaccination_cert = null;
        if (!empty($data['vaccination_cert'])) {
            $ext = getExtension($data['vaccination_cert_name'] ?? '', $data['vaccination_cert']);
            $vaccination_cert = saveBase64File($data['vaccination_cert'], 'uploads/user_certs/vacc_' . $userId . '_' . time(), $ext);
        }

        $health_cert = null;
        if (!empty($data['health_cert'])) {
            $ext = getExtension($data['health_cert_name'] ?? '', $data['health_cert']);
            $health_cert = saveBase64File($data['health_cert'], 'uploads/user_certs/health_' . $userId . '_' . time(), $ext);
        }

        $license_cert = null;
        if (!empty($data['license_cert'])) {
            $ext = getExtension($data['license_cert_name'] ?? '', $data['license_cert']);
            $license_cert = saveBase64File($data['license_cert'], 'uploads/user_certs/license_' . $userId . '_' . time(), $ext);
        }

        // Handle multiple photos
        $photos = $data['photos'] ?? [];
        if (empty($photos) && !empty($data['photo'])) {
            $photos = [$data['photo']];
        }

        $sql = "INSERT INTO user_pets (user_id, pet_name, species, breed, age, gender, description, image_url, vaccination_cert, health_cert, license_cert) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $userId,
            $petName,
            $species,
            $breed,
            $age,
            $gender,
            $description,
            $photo_url,
            $vaccination_cert,
            $health_cert,
            $license_cert
        ]);

        $petId = $conn->lastInsertId();

        // Save multiple photos to user_pet_images
        if (!empty($photos)) {
            $stmtImg = $conn->prepare("INSERT INTO user_pet_images (pet_id, image_url) VALUES (?, ?)");
            foreach ($photos as $idx => $base64) {
                $url = saveBase64File($base64, 'uploads/user_pets/pet_' . $userId . '_' . $petId . '_' . $idx . '_' . time(), 'jpg');
                if ($url) {
                    $stmtImg->execute([$petId, $url]);
                    // Set the first one as primary in user_pets table for backward compatibility
                    if ($idx === 0) {
                        $updateStmt = $conn->prepare("UPDATE user_pets SET image_url = ? WHERE pet_id = ?");
                        $updateStmt->execute([$url, $petId]);
                    }
                }
            }
        }

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Pet added successfully!",
            "pet_id" => intval($petId)
        ]);

    } catch (Exception $e) {
        if ($conn->inTransaction())
            $conn->rollBack();
        echo json_encode(["success" => false, "error" => "Failed to add pet: " . $e->getMessage()]);
    }
}

function handleDeletePet($conn)
{
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $petId = isset($data['pet_id']) ? intval($data['pet_id']) : 0;
    $userId = isset($data['user_id']) ? intval($data['user_id']) : (isset($data['buyer_id']) ? intval($data['buyer_id']) : 0);

    if ($petId <= 0 || $userId <= 0) {
        echo json_encode(["success" => false, "error" => "Pet ID and User ID are required"]);
        return;
    }

    try {
        // First delete any files associated with this pet
        $stmt = $conn->prepare("SELECT image_url, vaccination_cert, health_cert, license_cert FROM user_pets WHERE pet_id = ? AND user_id = ?");
        $stmt->execute([$petId, $userId]);
        $pet = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($pet) {
            foreach (['image_url', 'vaccination_cert', 'health_cert', 'license_cert'] as $field) {
                if ($pet[$field] && file_exists($pet[$field])) {
                    @unlink($pet[$field]);
                }
            }
        }

        $stmt = $conn->prepare("DELETE FROM user_pets WHERE pet_id = ? AND user_id = ?");
        $stmt->execute([$petId, $userId]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Pet removed successfully"]);
        } else {
            echo json_encode(["success" => false, "error" => "Pet not found or not owned by you"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Delete error: " . $e->getMessage()]);
    }
}

// ============== Helper Utilities ==============

function saveBase64File($base64_string, $path_without_ext, $extension)
{
    if (empty($base64_string))
        return null;

    // Detect and strip prefix
    if (preg_match('/^data:.*,/', $base64_string, $match)) {
        $base64_string = substr($base64_string, strlen($match[0]));
    }

    $data = base64_decode($base64_string);
    if (!$data)
        return null;

    $full_path = $path_without_ext . '.' . $extension;
    $dir = dirname($full_path);
    if (!file_exists($dir)) {
        @mkdir($dir, 0777, true);
    }

    if (file_put_contents($full_path, $data)) {
        return $full_path;
    }
    return null;
}

function getExtension($name, $base64)
{
    // 1. From filename
    if (!empty($name)) {
        $parts = explode('.', $name);
        if (count($parts) > 1) {
            $ext = strtolower(end($parts));
            if (in_array($ext, ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                return $ext == 'jpeg' ? 'jpg' : $ext;
            }
        }
    }
    // 2. From Base64 MIME
    if (preg_match('/^data:(.*?);/', $base64, $match)) {
        $mime = $match[1];
        if ($mime == 'application/pdf')
            return 'pdf';
        if ($mime == 'image/jpeg')
            return 'jpg';
        if ($mime == 'image/png')
            return 'png';
        if ($mime == 'image/webp')
            return 'webp';
    }
    // 3. Fallback
    return 'jpg';
}