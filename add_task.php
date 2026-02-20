<?php
session_start();
include "config.php";

if(!isset($_SESSION['user_id'])) exit();

if(isset($_POST['task'])){
    $task = $_POST['task'];
    $deadline = $_POST['deadline'];
    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("INSERT INTO tasks (task, deadline, user_id) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $task, $deadline, $user_id);
    $stmt->execute();
}

// Return updated tasks HTML
$result = $conn->query("SELECT * FROM tasks WHERE user_id=$user_id ORDER BY deadline ASC");
$today = date('Y-m-d');
foreach($result as $row){
    $overdue = ($row['deadline'] && $row['deadline'] < $today) ? "overdue" : "";
    $checked = $row['completed'] ? "checked" : "";
    $completedClass = $row['completed'] ? "completed" : "";

echo '<li id="task-'.$row['id'].'" class="task-item '.$overdue.' '.$completedClass.'">';    echo '<input type="checkbox" class="complete-checkbox" data-id="'.$row['id'].'" '.$checked.'>';
    echo '<span class="task-text">'.htmlspecialchars($row['task']);
    if($row['deadline']) echo " - ".$row['deadline'];
    echo '</span> ';
    echo '<button class="delete-btn" data-id="'.$row['id'].'">Delete</button>';
    echo '</li>';
}
?>