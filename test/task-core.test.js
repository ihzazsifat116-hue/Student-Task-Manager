'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const TaskCore = require('../task-core.js');

test('normalizeTasks ignores malformed records and trims valid titles', () => {
  const tasks = TaskCore.normalizeTasks([
    null,
    'not a task',
    { id: 1, title: '  Read chapter  ', completed: true },
    { id: 2, title: '   ', completed: false },
    { id: 3, title: 123, completed: false }
  ]);

  assert.deepEqual(tasks, [
    { id: '1', title: 'Read chapter', completed: true }
  ]);
});

test('normalizeTasks repairs missing and duplicate IDs', () => {
  const tasks = TaskCore.normalizeTasks([
    { id: 'same', title: 'First', completed: false },
    { id: 'same', title: 'Second', completed: true },
    { title: 'Third', completed: false }
  ]);

  assert.equal(tasks.length, 3);
  assert.equal(new Set(tasks.map((task) => task.id)).size, 3);
  assert.equal(tasks[0].id, 'same');
});

test('normalizeTasks safely handles non-array data and task-count limits', () => {
  assert.deepEqual(TaskCore.normalizeTasks({ title: 'Invalid shape' }), []);

  const manyTasks = Array.from({ length: TaskCore.MAX_TASKS + 5 }, (_, index) => ({
    id: index,
    title: `Task ${index}`
  }));
  assert.equal(TaskCore.normalizeTasks(manyTasks).length, TaskCore.MAX_TASKS);
});

test('normalizeTasks limits title length and normalizes completion values', () => {
  const longTitle = 'x'.repeat(TaskCore.MAX_TITLE_LENGTH + 20);
  const [task] = TaskCore.normalizeTasks([
    { id: 7, title: longTitle, completed: 'true' }
  ]);

  assert.equal(task.title.length, TaskCore.MAX_TITLE_LENGTH);
  assert.equal(task.completed, false);
});

test('createTask rejects blank titles and generates unique IDs', () => {
  assert.equal(TaskCore.createTask('   ', []), null);

  const first = TaskCore.createTask('Math homework', []);
  const second = TaskCore.createTask('Science homework', [first]);
  assert.ok(first);
  assert.ok(second);
  assert.notEqual(first.id, second.id);
  assert.equal(second.completed, false);
});

test('getCounts reports total, completed, and remaining tasks', () => {
  assert.deepEqual(TaskCore.getCounts([
    { completed: true },
    { completed: false },
    { completed: true }
  ]), {
    total: 3,
    completed: 2,
    remaining: 1
  });
});
