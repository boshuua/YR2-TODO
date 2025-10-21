<?php

require_once 'db.php'; 

header ('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = getConn();

if($pdo) {
    try {
        // Fetch all lists/columns
        $list_stmt = $pdo->query('SELECT list_id, list_name FROM lists ORDER BY list_order ASC');
        $lists = $list_stmt->fetchAll(PDO::FETCH_ASSOC);


        // Fetch all tasks
        $task_stmt = $pdo->query('SELECT id, task, is_completed, created_at, list_id FROM todos ORDER BY list_id, created_at ASC');
        $tasks = $task_stmt->fetchAll(PDO::FETCH_ASSOC);


        // struct task into list
        $board = [];
        $tasks_by_list = [];

        // prepare tasks | cast bool and group by list_id
        foreach ($tasks as $task) {
            $task['is_completed'] = (bool)$task['is_completed'];
            $tasks_by_list[$task['list_id']][] = $task;
        }

        // build board struct
        foreach($lists as $list) {
            $list_id = $list['list_id'];
            $list['tasks'] = $tasks_by_list[$list_id] ?? [];
            $board[] = $list;
        }

        echo json_encode($board);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get board: ' . $e->getMessage()]);
    }
}