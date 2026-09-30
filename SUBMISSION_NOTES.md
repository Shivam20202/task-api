# Submission Notes

## What Was Tested

The test suite covers the task service directly and the HTTP API through Supertest. It includes happy paths for all existing endpoints and edge cases around invalid input, missing tasks, filtering, pagination, completion, and assignment.

All 49 tests are currently passing.

## Test Coverage

The current overall coverage is:

- Statements: 94%
- Branches: 86.74%
- Functions: 93.1%
- Lines: 93.43%

This is above the 80% coverage target mentioned in the assignment.

## Design Decisions

For `PATCH /tasks/:id/assign`, I validate that `assignee` is a non-empty string and trim surrounding whitespace before storing it.

Reassignment is allowed because the operation is a PATCH and the brief does not specify that an existing assignee should be immutable. I would confirm this behavior with the product/team before production.

## What I Would Test Next

With more time, I would add tests for invalid pagination values, negative page and limit values, additional date validation cases, repeated completion requests, and interactions between filtering and pagination.

## Questions Before Production

Before shipping, I would clarify the expected behavior for invalid pagination values, task reassignment, editing completed tasks, maximum assignee length, data persistence, and authentication/authorization requirements.