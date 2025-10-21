<?php
require_once 'db.php';

// Set the content type to JSON
header('Content-Type: application/json');

// Get the DELETE data
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['id'])) {
    $id = $data['id'];
    
    $pdo = getConn();
    
    if ($pdo) {
        try {
            $sql = 'DELETE FROM todos WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Task deleted successfully.']);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['error' => 'Task not found.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete task: ' . $e->getMessage()]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: id is required.']);
}
?>