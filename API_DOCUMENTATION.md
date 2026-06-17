# Chptr. API Documentation

This document describes the public and private API endpoints available in the Chptr. story curation platform.

---

## 1. Works (Stories)

### GET `/api/works`
Retrieve a list of works with filtering, search, and sorting.

- **Authentication**: Not Required
- **Query Parameters**:
  - `search` (string, optional): Keyword search for titles or summaries.
  - `includeTags` (string, optional): Filter by tags to include (comma-separated, e.g. `Romance,Fantasy`).
  - `sortBy` (string, optional): Sorting option. Allowed: `updatedAt` (default), `kudos`, `comments`, `wordCountDesc`.
  - `limit` (number, optional): Number of stories to return per page (default: `10`).

### GET `/api/works/[workId]`
Retrieve full details of a single work.

- **Authentication**: Not Required
- **Route Parameters**:
  - `workId` (string, required): The ID of the story.

---

## 2. Chapters

### GET `/api/works/[workId]/chapters`
Retrieve all published chapters of a specific story.

- **Authentication**: Not Required
- **Route Parameters**:
  - `workId` (string, required): The ID of the story.

---

## 3. Comments & Feedback

### GET `/api/comments`
Retrieve discussion comments for a story (supports nested replies).

- **Authentication**: Not Required
- **Query Parameters**:
  - `workId` (string, required): The ID of the story to get comments for.
  - `limit` (number, optional): Max number of top-level comments to return (default: `10`).

---

## 4. Tags

### GET `/api/tags`
Search for tags by name (autocomplete helper).

- **Authentication**: Not Required
- **Query Parameters**:
  - `q` (string, optional): Autocomplete search keyword.

---

## 5. User Profiles

### GET `/api/users/[username]`
Retrieve public profile data, stats, and stories of a user.

- **Authentication**: Not Required
- **Route Parameters**:
  - `username` (string, required): The user's unique username.

---

## 6. Authentication

### POST `/api/register`
Register a new reader or author user.

- **Authentication**: Not Required
- **Request Body** (`application/json`):
  ```json
  {
    "username": "new_reader",
    "email": "new@domain.com",
    "password": "password123"
  }
  ```
- **Response**:
  - `201 Created` on success.
  - `400 Bad Request` or `409 Conflict` on error.
