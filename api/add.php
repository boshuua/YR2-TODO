<?php
require_once 'db.php'; // Includes CORS headers

// --- ADD THIS BLOCK ---
// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Headers are already set by db.php, just send OK status and exit.
    http_response_code(200); 
    exit();
}
// --- END OF BLOCK TO ADD --- 

// Set the content type to JSON
header('Content-Type: application/json');

// Get the POST data sent from the Angular app
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['task']) && !empty(trim($data['task']))) {
    $task = trim($data['task']);
    
    $pdo = getConn(); // Using the function name from your db.php
    
    if ($pdo) {
        try {
            // Prepare the SQL statement to prevent SQL injection
            $sql = 'INSERT INTO todos (task, is_completed) VALUES (?, ?)';
            $stmt = $pdo->prepare($sql);
            
            // Execute the statement with the task and 0 for false
            $stmt->execute([$task, 0]); 
            
            // Get the ID of the newly inserted row
            $id = $pdo->lastInsertId();
            
            // Fetch the newly created todo to return it to the frontend
            $stmt = $pdo->prepare('SELECT id, task, is_completed, created_at FROM todos WHERE id = ?');
            $stmt->execute([$id]);
            $newTodo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Ensure the returned value is boolean for the frontend
            if ($newTodo) {
              $newTodo['is_completed'] = (bool)$newTodo['is_completed'];
            }

            // Respond with the new todo item
            http_response_code(201); // Created
            echo json_encode($newTodo);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add task: ' . $e->getMessage()]);
        }
    }
} else {
    // Respond with an error if task data is missing
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid input: task is required.']);
}
?>