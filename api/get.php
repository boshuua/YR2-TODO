<?php
require_once 'db.php';

header('Content-Type: application/json');

$pdo = getConn();

if($pdo) {
    try {
        $stmt = $pdo->query('SELECT id, task, is_completed, created_at FROM todos ORDER BY created_at ASC');

        $todos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach($todos as &$todo){
            $todo['is_completed'] = (bool)$todo['is_completed'];
        }
        echo json_encode($todos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Cant get any tasks: ' . $e->getMessage()]);
    }
}