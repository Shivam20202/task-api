const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('POST /tasks', () => {
    test('creates a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Learn Supertest',
          description: 'Write API tests',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'Learn Supertest',
        description: 'Write API tests',
        status: 'todo',
        priority: 'high',
        dueDate: null,
        completedAt: null,
      });
      expect(response.body.id).toEqual(expect.any(String));
    });

    test('rejects a missing title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'title is required and must be a non-empty string'
      );
    });

    test('rejects an invalid priority', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Test',
          priority: 'urgent',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /tasks', () => {
    test('returns all tasks', async () => {
      await request(app).post('/tasks').send({ title: 'Task 1' });
      await request(app).post('/tasks').send({ title: 'Task 2' });

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('filters tasks by status', async () => {
      await request(app).post('/tasks').send({
        title: 'Todo',
        status: 'todo',
      });
      await request(app).post('/tasks').send({
        title: 'Done',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'todo' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('todo');
    });

    test('does not use partial status matching', async () => {
      await request(app).post('/tasks').send({
        title: 'Todo',
        status: 'todo',
      });
      await request(app).post('/tasks').send({
        title: 'Done',
        status: 'done',
      });

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'do' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('returns the first page correctly', async () => {
      for (let i = 1; i <= 5; i += 1) {
        await request(app).post('/tasks').send({ title: `Task ${i}` });
      }

      const response = await request(app)
        .get('/tasks')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.map((task) => task.title)).toEqual([
        'Task 1',
        'Task 2',
      ]);
    });

    test('returns an empty array when there are no tasks', async () => {
      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('PUT /tasks/:id', () => {
    test('updates an existing task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Original' });

      const response = await request(app)
        .put(`/tasks/${created.body.id}`)
        .send({
          title: 'Updated',
          priority: 'high',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: created.body.id,
        title: 'Updated',
        priority: 'high',
      });
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .put('/tasks/does-not-exist')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('rejects an empty title', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Original' });

      const response = await request(app)
        .put(`/tasks/${created.body.id}`)
        .send({ title: '   ' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('deletes an existing task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Delete me' });

      const response = await request(app)
        .delete(`/tasks/${created.body.id}`);

      expect(response.status).toBe(204);

      const list = await request(app).get('/tasks');
      expect(list.body).toHaveLength(0);
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .delete('/tasks/does-not-exist');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('completes a task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Complete me',
          priority: 'high',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).toEqual(expect.any(String));
    });

    test('returns 404 for an unknown task', async () => {
      const response = await request(app)
        .patch('/tasks/does-not-exist/complete');

      expect(response.status).toBe(404);
    });

    test('preserves task priority', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({
          title: 'Important task',
          priority: 'high',
        });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/complete`);

      expect(response.body.priority).toBe('high');
    });
  });

  describe('GET /tasks/stats', () => {
    test('returns task counts', async () => {
      await request(app).post('/tasks').send({
        title: 'Todo',
        status: 'todo',
      });
      await request(app).post('/tasks').send({
        title: 'Done',
        status: 'done',
      });

      const response = await request(app).get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        todo: 1,
        in_progress: 0,
        done: 1,
        overdue: 0,
      });
    });

    test('counts overdue incomplete tasks', async () => {
      await request(app).post('/tasks').send({
        title: 'Overdue task',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const response = await request(app).get('/tasks/stats');

      expect(response.body.overdue).toBe(1);
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    test('assigns a task to a user', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 'Shivam' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: created.body.id,
        assignee: 'Shivam',
      });
    });

    test('trims surrounding whitespace from an assignee name', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: '  Shivam  ' });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Shivam');
    });

    test('rejects a missing assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'assignee must be a non-empty string'
      );
    });

    test('rejects an empty or whitespace-only assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: '   ' });

      expect(response.status).toBe(400);
    });

    test('rejects a non-string assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 123 });

      expect(response.status).toBe(400);
    });

    test('returns 404 when the task does not exist', async () => {
      const response = await request(app)
        .patch('/tasks/does-not-exist/assign')
        .send({ assignee: 'Shivam' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('allows an existing task to be reassigned', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Reassign me' });

      await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 'Rahul' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 'Shivam' });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Shivam');
    });
  });
});