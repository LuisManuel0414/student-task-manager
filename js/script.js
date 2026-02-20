// Toggle dark mode and save preference
function toggleTheme() {
    document.body.classList.toggle("dark");
    let theme = document.body.classList.contains("dark") ? "dark" : "light";

    // Save theme to server via AJAX
    fetch("save_theme.php", {
        method: "POST",
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: `theme=${theme}`
    });
}


// Update task stats dynamically
function updateStats() {
    const total = document.querySelectorAll(".task-item").length;
    const completed = document.querySelectorAll(".task-item.completed").length;
    const pending = total - completed;

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("pending-tasks").textContent = pending;
}

// Animate a list of tasks
function animateTasks(tasks) {
    tasks.forEach((task, index) => {
        task.classList.remove("show"); // reset
        setTimeout(() => task.classList.add("show"), index * 50); // staggered animation
    });
}

// Attach delete button events
function attachDeleteEvents() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = function(){
            const taskId = this.dataset.id;
            fetch(`delete_task.php?id=${taskId}`, { method: "POST" })
            .then(() => {
                const li = document.getElementById(`task-${taskId}`);
                li.style.transition = "opacity 0.5s, transform 0.5s";
                li.style.opacity = 0;
                li.style.transform = "translateX(-20px)";
                setTimeout(() => {
                    li.remove();
                    updateStats();
                }, 500);
            });
        }
    });
}

// Attach completion checkbox events with animated move
function attachCompletionEvents() {
    document.querySelectorAll(".complete-checkbox").forEach(cb => {
        cb.onchange = function() {
            const taskId = this.dataset.id;
            const completed = this.checked ? 1 : 0;

            fetch("update_task.php", {
                method: "POST",
                headers: {'Content-Type':'application/x-www-form-urlencoded'},
                body: `id=${taskId}&completed=${completed}`
            })
            .then(() => {
                const li = document.getElementById(`task-${taskId}`);
                const taskList = li.parentNode;

                if(completed){
                    li.classList.add("completed");
                    // Animate to bottom
                    li.style.opacity = 0;
                    setTimeout(() => {
                        taskList.appendChild(li);
                        li.style.opacity = 1;
                    }, 300);
                } else {
                    li.classList.remove("completed");
                    // Animate back above first completed task
                    li.style.opacity = 0;
                    setTimeout(() => {
                        const firstCompleted = taskList.querySelector(".task-item.completed");
                        if(firstCompleted){
                            taskList.insertBefore(li, firstCompleted);
                        } else {
                            taskList.appendChild(li);
                        }
                        li.style.opacity = 1;
                    }, 300);
                }

                updateStats();
            });
        }
    });
}

// ===== Drag-and-drop functionality =====
let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter() {
    this.classList.add('over');
}

function handleDragLeave() {
    this.classList.remove('over');
}

function handleDrop(e) {
    e.stopPropagation();
    if (dragSrcEl !== this) {
        const parent = this.parentNode;
        parent.insertBefore(dragSrcEl, this.nextSibling);
        updateTaskOrder(); // Save order to DB
    }
    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.task-item').forEach(item => item.classList.remove('over'));
}

// Attach drag-and-drop events to tasks
function addDragAndDrop() {
    document.querySelectorAll('.task-item').forEach(task => {
        task.setAttribute('draggable', true);
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragenter', handleDragEnter);
        task.addEventListener('dragover', handleDragOver);
        task.addEventListener('dragleave', handleDragLeave);
        task.addEventListener('drop', handleDrop);
        task.addEventListener('dragend', handleDragEnd);
    });
}

// Update task order in database
function updateTaskOrder() {
    const taskOrder = Array.from(document.querySelectorAll('.task-item'))
        .map(task => task.id.replace('task-', ''));

    fetch('update_order.php', {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: `order=${taskOrder.join(',')}`
    });
}

// ===== Main =====
document.addEventListener("DOMContentLoaded", () => {
    // Filter tasks by selected date
const filterDateInput = document.getElementById('filter-date');
const clearFilterBtn = document.getElementById('clear-filter');

filterDateInput.addEventListener('change', function() {
    const selectedDate = this.value;
    document.querySelectorAll('.task-item').forEach(task => {
        const taskDeadline = task.dataset.deadline;
        if(taskDeadline === selectedDate){
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
});

// Clear filter button
clearFilterBtn.addEventListener('click', function() {
    filterDateInput.value = '';
    document.querySelectorAll('.task-item').forEach(task => task.style.display = '');
});
    const taskList = document.getElementById("task-list");
    const form = document.querySelector("form");

    // Animate existing tasks
    const existingTasks = taskList.querySelectorAll("li");
    existingTasks.forEach(task => task.classList.add("task-item"));
    animateTasks(existingTasks);

    // Attach initial events
    attachDeleteEvents();
    attachCompletionEvents();
    addDragAndDrop();
    updateStats();

    // Add task via AJAX
    form.addEventListener("submit", function(e){
        e.preventDefault();
        const formData = new FormData(form);

        fetch("add_task.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.text())
        .then(data => {
            // Replace task list HTML
            taskList.innerHTML = data;
            form.reset();

            // Attach events to new tasks
            attachDeleteEvents();
            attachCompletionEvents();
            addDragAndDrop();

            // Animate new tasks
            const newTasks = taskList.querySelectorAll(".task-item");
            animateTasks(newTasks);

            // Update stats
            updateStats();
        });
    });
});

function togglePassword() {
    const field = document.getElementById("password-field");
    field.type = field.type === "password" ? "text" : "password";
}