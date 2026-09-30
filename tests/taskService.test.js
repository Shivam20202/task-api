const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create', () => {
    test('creates a task with default values', () => {
      const task = taskService.create({ title: 'Learn Jest' });

      expect(task).toMatchObject({
        title: 'Learn Jest',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        completedAt: null,
      });
      expect(task.id).toEqual(expect.any(String));
      expect(task.createdAt).toEqual(expect.any(String));
    });

    test('creates a task with supplied values', () => {
      const task = taskService.create({
        title: 'Finish assignment',
        description: 'Write tests',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2030-01-01T00:00:00.000Z',
      });

      expect(task).toMatchObject({
        title: 'Finish assignment',
        description: 'Write tests',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2030-01-01T00:00:00.000Z',
      });
    });
  });

  describe('getAll', () => {
    test('returns all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks.map((task) => task.title)).toEqual(['Task 1', 'Task 2']);
    });

    test('returns an empty array when there are no tasks', () => {
      expect(taskService.getAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    test('finds an existing task', () => {
      const created = taskService.create({ title: 'Find me' });

      expect(taskService.findById(created.id)).toEqual(created);
    });

    test('returns undefined for an unknown id', () => {
      expect(taskService.findById('does-not-exist')).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    test('returns tasks with the requested status', () => {
      taskService.create({ title: 'Todo task', status: 'todo' });
      taskService.create({ title: 'Done task', status: 'done' });

      const result = taskService.getByStatus('todo');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Todo task');
    });

    test('uses exact status matching rather than substring matching', () => {
      taskService.create({ title: 'Todo task', status: 'todo' });
      taskService.create({ title: 'Done task', status: 'done' });

      expect(taskService.getByStatus('do')).toHaveLength(0);
    });
  });

  describe('getPaginated', () => {
    beforeEach(() => {
      for (let i = 1; i <= 5; i += 1) {
        taskService.create({ title: `Task ${i}` });
      }
    });

    test('returns the first page correctly', () => {
      const result = taskService.getPaginated(1, 2);

      expect(result.map((task) => task.title)).toEqual(['Task 1', 'Task 2']);
    });

    test('returns the second page correctly', () => {
      const result = taskService.getPaginated(2, 2);

      expect(result.map((task) => task.title)).toEqual(['Task 3', 'Task 4']);
    });

    test('returns an empty array beyond the available pages', () => {
      expect(taskService.getPaginated(10, 2)).toEqual([]);
    });
  });

  describe('update', () => {
    test('updates an existing task', () => {
      const created = taskService.create({
        title: 'Original title',
        priority: 'low',
      });

      const updated = taskService.update(created.id, {
        title: 'Updated title',
        priority: 'high',
      });

      expect(updated).toMatchObject({
        id: created.id,
        title: 'Updated title',
        priority: 'high',
      });
    });

    test('returns null for an unknown task', () => {
      expect(taskService.update('missing-id', { title: 'Updated' })).toBeNull();
    });
  });

  describe('remove', () => {
    test('removes an existing task', () => {
      const created = taskService.create({ title: 'Delete me' });

      expect(taskService.remove(created.id)).toBe(true);
      expect(taskService.findById(created.id)).toBeUndefined();
    });

    test('returns false for an unknown task', () => {
      expect(taskService.remove('missing-id')).toBe(false);
    });
  });

  describe('completeTask', () => {
    test('marks a task as done and records completion time', () => {
      const created = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const completed = taskService.completeTask(created.id);

      expect(completed.status).toBe('done');
      expect(completed.completedAt).toEqual(expect.any(String));
    });

    test('preserves the existing priority when completing a task', () => {
      const created = taskService.create({
        title: 'High priority task',
        priority: 'high',
      });

      const completed = taskService.completeTask(created.id);

      expect(completed.priority).toBe('high');
    });

    test('returns null for an unknown task', () => {
      expect(taskService.completeTask('missing-id')).toBeNull();
    });
  });

  describe('getStats', () => {
    test('returns counts by status', () => {
      taskService.create({ title: 'Todo', status: 'todo' });
      taskService.create({ title: 'In progress', status: 'in_progress' });
      taskService.create({ title: 'Done', status: 'done' });

      expect(taskService.getStats()).toMatchObject({
        todo: 1,
        in_progress: 1,
        done: 1,
      });
    });

    test('counts overdue incomplete tasks', () => {
      taskService.create({
        title: 'Overdue',
        status: 'todo',
        dueDate: '2020-01-01T00:00:00.000Z',
      });
      taskService.create({
        title: 'Future',
        status: 'todo',
        dueDate: '2099-01-01T00:00:00.000Z',
      });

      expect(taskService.getStats().overdue).toBe(1);
    });

    test('does not count completed overdue tasks', () => {
      taskService.create({
        title: 'Completed overdue',
        status: 'done',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      expect(taskService.getStats().overdue).toBe(0);
    });
  });

  describe('assignTask', () => {
    test('assigns a task to a user', () => {
      const created = taskService.create({ title: 'Assign me' });

      const updated = taskService.assignTask(created.id, 'Shivam');

      expect(updated).toMatchObject({
        id: created.id,
        assignee: 'Shivam',
      });
    });

    test('allows an existing assignee to be changed', () => {
      const created = taskService.create({ title: 'Reassign me' });

      taskService.assignTask(created.id, 'Rahul');
      const updated = taskService.assignTask(created.id, 'Shivam');

      expect(updated.assignee).toBe('Shivam');
    });

    test('returns null for an unknown task', () => {
      expect(taskService.assignTask('missing-id', 'Shivam')).toBeNull();
    });
  });
});