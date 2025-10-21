<?php
require_once 'db.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // just send OK status and exit.
    http_response_code(200); 
    exit();
}
// Set the content type to JSON
header('Content-Type: application/json');

// Get the PUT data
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id']) && isset($data['is_completed'])) {
    $id = $data['id'];
    // Ensure is_completed is a boolean
    $is_completed = (bool)$data['is_completed'];
    
    $pdo = getConn();
    
    if ($pdo) {
        try {
            $sql = 'UPDATE todos SET is_completed = ? WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$is_completed, $id]);
            
            // Check if any row was updated
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Task updated successfully.']);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['error' => 'Task not found or no change made.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update task: ' . $e->getMessage()]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: id and is_completed are required.']);
}
?>