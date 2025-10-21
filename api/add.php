<?php
require_once 'db.php';

// Set the content type to JSON
header('Content-Type: application/json');

// Get the POST data sent from the Angular app
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['task']) && !empty(trim($data['task']))) {
    $task = trim($data['task']);
    
    $pdo = getConn();
    
    if ($pdo) {
        try {
            // Prepare the SQL statement to prevent SQL injection
            $sql = 'INSERT INTO todos (task, is_completed) VALUES (?, ?)';
            $stmt = $pdo->prepare($sql);
            
            // Execute the statement with the task and a default completed status of false
            $stmt->execute([$task, false]);
            
            // Get the ID of the newly inserted row
            $id = $pdo->lastInsertId();
            
            // Fetch the newly created todo to return it to the frontend
            $stmt = $pdo->prepare('SELECT id, task, is_completed, created_at FROM todos WHERE id = ?');
            $stmt->execute([$id]);
            $newTodo = $stmt->fetch(PDO::FETCH_ASSOC);
            $newTodo['is_completed'] = (bool)$newTodo['is_completed'];

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