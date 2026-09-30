# Bug Report

## Bug 1 — Pagination skips the first page

### Location
`src/services/taskService.js`

### Expected behavior
`GET /tasks?page=1&limit=2` should return the first two tasks.

### Actual behavior
The service calculated the offset as `page * limit`. For page 1 and limit 2, the offset was 2, so the first two tasks were skipped.

### How testing discovered it
A unit test created five tasks and requested page 1 with a limit of 2. The expected result was Task 1 and Task 2, but the implementation returned Task 3 and Task 4.

### Fix
Changed the offset calculation to:

```js
const offset = (page - 1) * limit;
```

This makes page 1 start at index 0.

---

## Bug 2 — Status filtering uses partial matching

### Location
`src/services/taskService.js`

### Expected behavior
A status filter should match the complete status value. For example, `status=todo` should only return tasks whose status is exactly `todo`.

### Actual behavior
The implementation used:

```js
t.status.includes(status)
```

This performs substring matching, so a value such as `do` can match both `todo` and `done`.

### How testing discovered it
A unit/API test created both a `todo` task and a `done` task, then used a partial status value. The implementation returned matches even though the value was not a valid complete status.

### Fix
Changed the filter to exact matching:

```js
task.status === status
```

---

## Bug 3 — Completing a task changes its priority

### Location
`src/services/taskService.js`

### Expected behavior
Completing a task should change its status to `done` and set `completedAt`. The existing priority should remain unchanged.

### Actual behavior
The implementation explicitly set:

```js
priority: 'medium'
```

This changed a high-priority task to medium priority when it was completed.

### How testing discovered it
A test created a high-priority task and completed it. The returned task had a medium priority, exposing the unexpected mutation.

### Fix
Removed the priority assignment from `completeTask` so the existing priority is preserved.

---

## Bug-fixing approach

The fixes were kept small and isolated. Each behavior has a regression test so that the bug should not return unnoticed during future changes.
