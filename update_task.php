<?php
session_start();
include "config.php";

if(!isset($_SESSION['user_id'])) exit();

if(isset($_POST['id']) && isset($_POST['completed'])){
    $task_id = $_POST['id'];
    $completed = $_POST['completed'];
    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("UPDATE tasks SET completed=? WHERE id=? AND user_id=?");
    $stmt->bind_param("iii", $completed, $task_id, $user_id);
    $stmt->execute();
}
?>