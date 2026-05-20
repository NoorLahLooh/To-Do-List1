
// ===== STATE =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ===== DOM ELEMENTS =====
const taskInput     = document.getElementById('taskInput');
const descInput     = document.getElementById('descInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn        = document.getElementById('addBtn');
const taskList      = document.getElementById('taskList');
const emptyState    = document.getElementById('emptyState');
const totalCount    = document.getElementById('totalCount');
const activeCount   = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const filterBtns    = document.querySelectorAll('.filter-btn');

// ===== SAVE TO LOCALSTORAGE =====
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== GENERATE ID =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ===== ADD TASK =====
function addTask() {
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    taskInput.style.borderColor = '#ef4444';
    setTimeout(() => taskInput.style.borderColor = '', 1000);
    return;
  }

  const task = {
    id: generateId(),
    title,
    desc: descInput.value.trim(),
    priority: prioritySelect.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
  updateStats();

  // Reset inputs
  taskInput.value = '';
  descInput.value = '';
  prioritySelect.value = 'medium';
  taskInput.focus();
}

// ===== DELETE TASK =====
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStats();
}

// ===== TOGGLE COMPLETE =====
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  renderTasks();
  updateStats();
}

// ===== FILTER TASKS =====
function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':    return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t => t.completed);
    case 'high':      return tasks.filter(t => t.priority === 'high');
    case 'medium':    return tasks.filter(t => t.priority === 'medium');
    case 'low':       return tasks.filter(t => t.priority === 'low');
    default:          return tasks;
  }
}

// ===== CREATE TASK ELEMENT =====
function createTaskElement(task) {
  const item = document.createElement('div');
  item.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
  item.dataset.id = task.id;

  item.innerHTML = `
    <input
      type="checkbox"
      class="task-checkbox"
      ${task.completed ? 'checked' : ''}
    />
    <div class="task-content">
      <span class="task-title">${escapeHTML(task.title)}</span>
      ${task.desc ? `<span class="task-desc">${escapeHTML(task.desc)}</span>` : ''}
      <div class="task-meta">
        <span class="task-priority ${task.priority}">
          ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
          ${task.priority}
        </span>
      </div>
    </div>
    <button class="task-delete" title="Delete task">✕</button>
  `;

  // Events
  item.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
  item.querySelector('.task-delete').addEventListener('click', () => deleteTask(task.id));

  return item;
}

// ===== ESCAPE HTML (security) =====
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== RENDER TASKS =====
function renderTasks() {
  const filtered = getFilteredTasks();

  // Clear list (keep emptyState)
  Array.from(taskList.children).forEach(child => {
    if (child.id !== 'emptyState') child.remove();
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  filtered.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });
}

// ===== UPDATE STATS =====
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active    = total - completed;

  totalCount.textContent     = total;
  activeCount.textContent    = active;
  completedCount.textContent = completed;
}

// ===== FILTER BUTTONS =====
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ===== ADD BUTTON =====
addBtn.addEventListener('click', addTask);

// ===== ENTER KEY =====
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ===== INIT =====
renderTasks();
updateStats();