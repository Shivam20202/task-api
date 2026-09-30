# Task Manager API — Take-Home Assignment

**Candidate:** Shivam Pandey

**Stack:** Node.js, Express, Jest, Supertest

## Overview

This is my completed solution for the Task Manager API take-home assignment.

The work includes unit tests for the task service, API integration tests using Supertest, bug investigation and fixes, and the requested task assignment feature.

## What I implemented

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