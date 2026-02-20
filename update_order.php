<?php
session_start();
include "config.php";

if(!isset($_SESSION['user_id']) || !isset($_POST['order'])) exit();

$order = explode(',', $_POST['order']);
$user_id = $_SESSION['user_id'];

// Update each task's position
foreach($order as $position => $task_id){
    $stmt = $conn->prepare("UPDATE tasks SET position=? WHERE id=? AND user_id=?");
    $stmt->bind_param("iii", $position, $task_id, $user_id);
    $stmt->execute();
}
?>