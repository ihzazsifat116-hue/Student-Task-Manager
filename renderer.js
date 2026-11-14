'use strict';

const taskInput = document.getElementById('taskInput');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const emptyMessage = document.getElementById('emptyMessage');
const message = document.getElementById('message');

const STORAGE_KEY = 'studentTasks';
const BACKUP_KEY = 'studentTasks.corruptBackup';

function getSafeStorage() {
  try {
    return window.localStorage;
  } catch (_error) {
    return null;
  }
}

const storage = getSafeStorage();
let tasks = [];

function setMessage(text, type = 'error') {
  message.textContent = text;
  message.classList.toggle('success', type === 'success' && Boolean(text));
  message.classList.toggle('error', type === 'error' && Boolean(text));
}

function saveTasks() {
  if (!storage) return false;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch (_error) {
    return false;
  }
}

function loadTasks() {
  if (!storage) {
    return 'Local storage is unavailable. Tasks will only remain until this window closes.';
  }

  let rawData;
  try {
    rawData = storage.getItem(STORAGE_KEY);
  } catch (_error) {
    return 'Saved tasks could not be read. You can still use the app during this session.';
  }

  if (rawData === null) return '';

  try {
    const parsed = JSON.parse(rawData);
    tasks = TaskCore.normalizeTasks(parsed);

    // Rewrite older or malformed records into the current, validated format.
    if (!Array.isArray(parsed) || JSON.stringify(parsed) !== JSON.stringify(tasks)) {
      if (!saveTasks()) {
        return 'Some saved task data needed repair, but the repaired list could not be saved.';
      }
      return 'Some invalid saved task entries were repaired or removed.';
    }

    return '';
  } catch (_error) {
    // Keep a best-effort copy of damaged data before replacing it with an empty list.
    try {
      storage.setItem(BACKUP_KEY, rawData);
    } catch (_backupError) {
      // A backup may fail when storage is full; the app should still open safely.
    }

    tasks = [];
    if (!saveTasks()) {
      return 'Saved task data was damaged. The app opened with an empty list, but could not reset storage.';
    }
    return 'Saved task data was damaged. A backup was kept when possible, and a fresh list is ready.';
  }
}

function renderTasks() {
  const fragment = document.createDocumentFragment();

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = task.completed ? 'task-item completed' : 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.className = 'task-checkbox';
    checkbox.setAttribute('aria-label', `Mark ${task.title} as completed`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      persistAndRender();
    });

    const taskText = document.createElement('span');
    taskText.className = 'task-title';
    // textContent prevents task titles from being interpreted as HTML.
    taskText.textContent = task.title;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.setAttribute('aria-label', `Delete task: ${task.title}`);
    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
      persistAndRender();
    });

    item.append(checkbox, taskText, deleteButton);
    fragment.appendChild(item);
  }

  taskList.replaceChildren(fragment);

  const counts = TaskCore.getCounts(tasks);
  taskCount.textContent = `${counts.remaining} remaining · ${counts.total} total`;
  emptyMessage.hidden = counts.total !== 0;
}

function persistAndRender(successMessage = '') {
  renderTasks();
  if (!saveTasks()) {
    setMessage('Changes are visible, but could not be saved. Check storage space or permissions.', 'error');
    return;
  }
  setMessage(successMessage, successMessage ? 'success' : 'error');
}

function addTask(event) {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (!title) {
    setMessage('Please write a task first.');
    taskInput.focus();
    return;
  }

  if (tasks.length >= TaskCore.MAX_TASKS) {
    setMessage(`You can keep up to ${TaskCore.MAX_TASKS} tasks in this list.`);
    taskInput.focus();
    return;
  }

  const newTask = TaskCore.createTask(title, tasks);
  if (!newTask) {
    setMessage('Please enter a valid task.');
    taskInput.focus();
    return;
  }

  tasks.push(newTask);
  taskInput.value = '';
  persistAndRender('Task added.');
  taskInput.focus();
}

taskForm.addEventListener('submit', addTask);

const loadMessage = loadTasks();
renderTasks();
if (loadMessage) setMessage(loadMessage, 'error');
