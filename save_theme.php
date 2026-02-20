<?php
session_start();
include "config.php";

if(!isset($_SESSION['user_id']) || !isset($_POST['theme'])) exit();

$theme = $_POST['theme'];
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("UPDATE users SET theme=? WHERE id=?");
$stmt->bind_param("si", $theme, $user_id);
$stmt->execute();
?>