<?php
require_once 'db.php';

header('Content-Type: application/json');

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

// FIX: Check for list_id and use it in the query
if (isset($data['task']) && !empty(trim($data['task'])) && isset($data['list_id'])) {
    $task = trim($data['task']);
    $list_id = $data['list_id'];
    
    $pdo = getConn(); 
    
    if ($pdo) {
        try {
            // UPDATED SQL: Included list_id column and binding
            $sql = 'INSERT INTO todos (task, is_completed, list_id) VALUES (?, ?, ?)';
            $stmt = $pdo->prepare($sql);
            
            // UPDATED EXECUTE: Bind task, 0 (for false), and list_id
            $stmt->execute([$task, 0, $list_id]); 
            
            $id = $pdo->lastInsertId();
            
            // UPDATED SELECT: Included list_id field in the return
            $stmt = $pdo->prepare('SELECT id, task, is_completed, created_at, list_id FROM todos WHERE id = ?');
            $stmt->execute([$id]);
            $newTodo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($newTodo) {
              $newTodo['is_completed'] = (bool)$newTodo['is_completed'];
            }

            http_response_code(201); 
            echo json_encode($newTodo);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add task: ' . $e->getMessage()]); 
        }
    }
} else {
    http_response_code(400); 
    echo json_encode(['error' => 'Invalid input: task and list_id are required.']);
}