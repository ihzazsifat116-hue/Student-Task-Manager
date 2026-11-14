'use strict';

// Shared, dependency-free task helpers. This file works in both the renderer
// and Node's built-in test runner.
(function attachTaskCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TaskCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createTaskCore() {
  const MAX_TITLE_LENGTH = 100;
  const MAX_TASKS = 500;

  function makeId(usedIds) {
    let id;
    do {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    } while (usedIds.has(id));
    return id;
  }

  function normalizeTasks(value) {
    if (!Array.isArray(value)) return [];

    const tasks = [];
    const usedIds = new Set();

    for (const candidate of value) {
      if (tasks.length >= MAX_TASKS) break;
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;

      const title = typeof candidate.title === 'string'
        ? candidate.title.trim().slice(0, MAX_TITLE_LENGTH)
        : '';
      if (!title) continue;

      const suppliedId = (typeof candidate.id === 'string' || typeof candidate.id === 'number')
        ? String(candidate.id).trim()
        : '';
      const id = suppliedId && !usedIds.has(suppliedId)
        ? suppliedId
        : makeId(usedIds);

      usedIds.add(id);
      tasks.push({
        id,
        title,
        completed: candidate.completed === true
      });
    }

    return tasks;
  }

  function createTask(title, existingTasks) {
    const cleanTitle = typeof title === 'string'
      ? title.trim().slice(0, MAX_TITLE_LENGTH)
      : '';
    if (!cleanTitle) return null;

    const usedIds = new Set(
      (Array.isArray(existingTasks) ? existingTasks : [])
        .map((task) => String(task && task.id))
    );

    return {
      id: makeId(usedIds),
      title: cleanTitle,
      completed: false
    };
  }

  function getCounts(tasks) {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const completed = safeTasks.filter((task) => task && task.completed === true).length;
    return {
      total: safeTasks.length,
      completed,
      remaining: safeTasks.length - completed
    };
  }

  return {
    MAX_TITLE_LENGTH,
    MAX_TASKS,
    normalizeTasks,
    createTask,
    getCounts
  };
});
