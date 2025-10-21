<?php
require_once 'db.php';

header('Content-Type: application/json');

// Handle OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();
}

// Get the PUT data
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id']) && isset($data['list_id'])) {
    $id = $data['id'];
    $list_id = $data['list_id'];
    
    $pdo = getConn();
    
    if ($pdo) {
        try {
            // Update the list_id (column) of the task
            $sql = 'UPDATE todos SET list_id = ? WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$list_id, $id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Task moved successfully.']);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['error' => 'Task not found or no change made.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to move task: ' . $e->getMessage()]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: id and list_id are required.']);
}
?>