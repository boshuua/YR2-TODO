<?php
require_once 'db.php'; 

header('Content-Type: application/json');

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();
}

$pdo = getConn();

if($pdo) {
    try {
        // 1. Fetch all Lists/Columns
        $list_stmt = $pdo->query('SELECT list_id, list_name FROM lists ORDER BY list_order ASC');
        $lists = $list_stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Fetch all Tasks
        $task_stmt = $pdo->query('
            SELECT id, task, is_completed, created_at, list_id 
            FROM todos 
            ORDER BY list_id, created_at ASC
        ');
        $tasks = $task_stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Structure Tasks into Lists
        $board = [];
        $tasks_by_list = [];

        foreach ($tasks as $task) {
            $task['is_completed'] = (bool)$task['is_completed'];
            $tasks_by_list[$task['list_id']][] = $task;
        }

        foreach ($lists as $list) {
            $list_id = $list['list_id'];
            $list['tasks'] = $tasks_by_list[$list_id] ?? [];
            $board[] = $list;
        }

        echo json_encode($board);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to retrieve board: ' . $e->getMessage()]);
    }
}
?>