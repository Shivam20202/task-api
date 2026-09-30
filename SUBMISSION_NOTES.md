# Submission Notes

## What was tested

The test suite covers the task service directly and the HTTP API through Supertest. It includes happy paths for all existing endpoints and edge cases around invalid input, missing tasks, filtering, pagination, completion, and assignment.

## Design decisions

For `PATCH /tasks/:id/assign`, I validate that `assignee` is a non-empty string and trim surrounding whitespace before storing it. Reassignment is allowed because the operation is a PATCH and the brief does not specify that an existing assignee should be immutable.

## Important

Run `npm test` and `npm run coverage` locally before submission and include the actual coverage result in the final submission message or README if requested.
