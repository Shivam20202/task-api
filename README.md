# Task Manager API — Take-Home Assignment

**Candidate:** Shivam Pandey

**Stack:** Node.js, Express, Jest, Supertest

## Links

### Live API

https://task-api-c5r5.onrender.com

### Example Endpoint

https://task-api-c5r5.onrender.com/tasks

## Overview

This is my completed solution for the Task Manager API take-home assignment.

The work includes unit tests for the task service, API integration tests using Supertest, bug investigation and fixes, and the requested task assignment feature.

## What I Implemented

- Added unit tests for `taskService.js` using Jest
- Added API integration tests using Supertest
- Covered happy paths for the existing API endpoints
- Added edge-case and validation tests
- Fixed the pagination offset bug
- Fixed partial status filtering
- Fixed the completion logic changing task priority
- Added `PATCH /tasks/:id/assign`
- Added validation for the `assignee` field
- Added tests for task assignment and reassignment
- Added a bug report documenting the issues found
- Added submission notes and production considerations

## Test Results

All tests are currently passing.

```text
Test Suites: 2 passed, 2 total
Tests:       49 passed, 49 total
Snapshots:   0 total
```

Run the test suite with:

```bash
npm test
```

## Coverage

The current test coverage is:

| Metric | Coverage |
|---|---:|
| Statements | 94% |
| Branches | 86.74% |
| Functions | 93.1% |
| Lines | 93.43% |

The assignment requested 80%+ coverage, and the current overall coverage is above that target.

Generate the coverage report with:

```bash
npm run coverage
```

## How to Run Locally

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run coverage
```

Start the API:

```bash
npm start
```

The API runs on:

```text
http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List all tasks |
| GET | `/tasks?status=todo` | Filter tasks by status |
| GET | `/tasks?page=1&limit=10` | Paginated task list |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| PATCH | `/tasks/:id/complete` | Mark a task as complete |
| GET | `/tasks/stats` | Get task statistics |
| PATCH | `/tasks/:id/assign` | Assign a task |

## New Feature — Task Assignment

### PATCH `/tasks/:id/assign`

Request:

```json
{
  "assignee": "Shivam"
}
```

The endpoint:

- Accepts an assignee name as a string
- Rejects an empty or whitespace-only string
- Rejects non-string values
- Trims surrounding whitespace
- Returns `404` if the task does not exist
- Returns the updated task
- Allows an existing task to be reassigned

I treated reassignment as valid because this is a PATCH/update operation and the assignment brief does not specify that an existing assignee should be protected. This is something I would confirm with the product/team before production.

## Bug Report

The bugs found through testing are documented in `BUG_REPORT.md`.

The report includes:

- Expected behavior
- Actual behavior
- How the issue was discovered
- Suggested/final fix

## Bugs Found

### 1. Pagination Offset

The first page was skipping the first set of tasks because the offset was calculated using:

```js
page * limit
```

It was corrected to:

```js
(page - 1) * limit
```

### 2. Status Filtering

Status filtering used partial string matching instead of exact matching.

It was changed to use exact status comparison.

### 3. Completion Changed Priority

Completing a task unexpectedly changed its priority to `medium`.

The completion logic was changed so that completing a task preserves its existing priority.

## What I Would Test Next

With more time, I would add tests for:

- Invalid pagination values
- Negative page and limit values
- Additional date validation cases
- Repeated completion requests
- Interactions between filtering and pagination
- Maximum assignee length
- Additional validation branches
- Error-handling middleware

## What Surprised Me

The API was small and easy to follow, but some issues were not obvious from reading the route handlers alone. Testing multiple records exposed the pagination and filtering issues, while testing task completion exposed the unexpected priority mutation.

## Questions Before Production

Before shipping, I would clarify:

- What should happen for invalid or negative page/limit values?
- Can tasks be reassigned?
- Can completed tasks be edited?
- Should `assignee` have a maximum length?
- Should task data persist after the server restarts?
- What authentication and authorization requirements will the API have?


## Submission Notes

The project includes:

- Unit tests with Jest
- API integration tests with Supertest
- Bug report and fixes
- The requested task assignment feature
- Validation and edge-case tests
- Coverage above the requested 80% target
- A deployed live API for review
