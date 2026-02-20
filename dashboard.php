<?php
session_start();
include "config.php";

// Redirect if not logged in
if(!isset($_SESSION['user_id'])){
    header("Location: login.php");
    exit();
}

// Get user theme
$result = $conn->query("SELECT theme FROM users WHERE id=".$_SESSION['user_id']);
$userTheme = $result->fetch_assoc()['theme'];

// User ID
$user_id = $_SESSION['user_id'];

// Stats
$total = $conn->query("SELECT COUNT(*) AS count FROM tasks WHERE user_id=$user_id")->fetch_assoc()['count'];
$completed = $conn->query("SELECT COUNT(*) AS count FROM tasks WHERE user_id=$user_id AND completed=1")->fetch_assoc()['count'];
$pending = $total - $completed;

// Get tasks ordered by 'position' for drag-and-drop
$result = $conn->query("SELECT * FROM tasks WHERE user_id=$user_id ORDER BY position ASC");
?>
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="css/style.css">
<script src="js/script.js"></script>
<title>Student Task Manager</title>
</head>
<body class="<?= $userTheme === 'dark' ? 'dark' : '' ?>">
<div class="card">
<h1>Welcome, <?php echo $_SESSION['username']; ?> 👋</h1>

<!-- Add Task Form -->
<form action="add_task.php" method="POST">
    <input type="text" name="task" placeholder="Add a new task..." required>
    <input type="date" name="deadline">
    <button>Add Task</button>
</form>

<!-- Stats -->
<div class="stats" id="stats">
    <p>Total Tasks: <strong id="total-tasks"><?= $total ?></strong></p>
    <p>Completed: <strong id="completed-tasks"><?= $completed ?></strong></p>
    <p>Pending: <strong id="pending-tasks"><?= $pending ?></strong></p>
</div>

<h3>Your Tasks:</h3>

<!-- Calendar Filter -->
<div id="calendar-filter" style="margin-bottom:10px;">
    <input type="date" id="filter-date">
    <button type="button" id="clear-filter">Clear Filter</button>
</div>

<div id="task-list">
    <ul>
    <?php 
    $today = date('Y-m-d');
    while($row = $result->fetch_assoc()) { 
        // Deadline color coding
        $deadlineClass = "";
        if($row['deadline']){
            if($row['deadline'] < $today) $deadlineClass = "overdue";
            else if($row['deadline'] == $today) $deadlineClass = "today";
            else $deadlineClass = "upcoming";
        }
    ?>
        <li id="task-<?= $row['id'] ?>" class="task-item <?= $deadlineClass ?> <?= $row['completed'] ? 'completed' : '' ?>" data-deadline="<?= $row['deadline'] ?>">
            <input type="checkbox" class="complete-checkbox" data-id="<?= $row['id'] ?>" <?= $row['completed'] ? 'checked' : '' ?>>
            <span class="task-text"><?= htmlspecialchars($row['task']) ?> <?php if($row['deadline']) echo " - ".$row['deadline']; ?></span>
            <button class="delete-btn" data-id="<?= $row['id'] ?>">Delete</button>
        </li>
    <?php } ?>
    </ul>
</div>

<!-- Controls -->
<button onclick="toggleTheme()">Toggle Dark Mode</button>
<a href="logout.php" style="display:block; margin-top:10px; text-align:center;">Logout</a>
</div>
</body>
</html>