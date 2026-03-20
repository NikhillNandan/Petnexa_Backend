<?php
// get_breed_analysis.php - Get breed-specific care data
error_reporting(0);
ini_set('display_errors', 0);
require_once 'db.php';

header('Content-Type: application/json');

$breed = isset($_GET['breed']) ? trim($_GET['breed']) : '';

if (empty($breed)) {
    echo json_encode(array("status" => "error", "message" => "breed parameter is required"));
    exit;
}

$row = null;

// Step 1: Try exact match
$stmt = $conn->prepare("SELECT * FROM breed_analysis WHERE LOWER(breed_name) = LOWER(?) LIMIT 1");
$stmt->bind_param("s", $breed);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
}
$stmt->close();

// Step 2: Try partial match (breed name contains input or input contains breed name)
if (!$row) {
    $likeTerm = "%" . $breed . "%";
    $stmt2 = $conn->prepare("SELECT * FROM breed_analysis WHERE LOWER(breed_name) LIKE LOWER(?) LIMIT 1");
    $stmt2->bind_param("s", $likeTerm);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    if ($result2->num_rows > 0) {
        $row = $result2->fetch_assoc();
    }
    $stmt2->close();
}

// Step 3: Try word-by-word matching (first significant word of the input breed)
if (!$row) {
    $words = preg_split('/[\s\-]+/', $breed);
    foreach ($words as $word) {
        if (strlen($word) < 3) continue; // Skip short words
        $likeTerm = "%" . $word . "%";
        $stmt3 = $conn->prepare("SELECT * FROM breed_analysis WHERE LOWER(breed_name) LIKE LOWER(?) LIMIT 1");
        $stmt3->bind_param("s", $likeTerm);
        $stmt3->execute();
        $result3 = $stmt3->get_result();
        if ($result3->num_rows > 0) {
            $row = $result3->fetch_assoc();
            $stmt3->close();
            break;
        }
        $stmt3->close();
    }
}

if (!$row) {
    echo json_encode(array("status" => "not_found", "message" => "Breed not found: " . $breed));
    $conn->close();
    exit;
}

// Build response
$response = array(
    "status" => "success",
    "breed_name" => $row['breed_name'],
    "animal_type" => $row['animal_type'],
    "food_best" => $row['food_best'],
    "food_secondary" => $row['food_secondary'],
    "feeding_frequency" => $row['feeding_frequency'],
    "vet_checkup" => $row['vet_checkup'],
    "dental_care" => $row['dental_care'],
    "exercise" => $row['exercise'],
    "grooming" => $row['grooming'],
    "dos" => array_values(array_filter([$row['do_1'], $row['do_2'], $row['do_3'], $row['do_4']])),
    "donts" => array_values(array_filter([$row['dont_1'], $row['dont_2'], $row['dont_3'], $row['dont_4']])),
    "best_suited" => $row['best_suited'],
    "climate" => $row['climate'],
    "great_with" => $row['great_with']
);

echo json_encode($response);

$conn->close();
?>
