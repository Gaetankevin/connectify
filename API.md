# API Documentation

## Overview

This API provides endpoints for user authentication, session management, and conversation (discussion) handling with real-time messaging capabilities.

---

## Authentication

All protected endpoints require a valid session cookie. The session is managed via:
- **Cookie Name**: `session` (configurable via `SESSION_COOKIE_NAME` env var)
- **Storage**: Session tokens are hashed and stored in the database with an expiry time
- **Duration**: Configurable via `SESSION_DAYS` env var (default: 7 days)

---

## Endpoints

### User Management

#### Search Users
**GET** `/api/users/search?q=<query>`

Search for users by username, email, name, or surname.

**Query Parameters:**
- `q` (string, required): Search query (minimum 2 characters)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "name": "John",
      "surname": "Doe"
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid query (too short or missing)
- `500`: Server error

---

### Conversations (Discussions)

#### Get All Conversations
**GET** `/api/conversations`

Fetch all discussions for the current user with the latest message in each.

**Headers:**
- Requires valid session cookie

**Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "otherUser": {
        "id": 2,
        "username": "jane_smith",
        "name": "Jane",
        "surname": "Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-30T10:00:00Z",
      "updatedAt": "2025-11-30T15:30:00Z",
      "lastMessage": {
        "id": 5,
        "content": "How are you?",
        "mediaType": null,
        "mediaUrl": null,
        "createdAt": "2025-11-30T15:30:00Z",
        "senderId": 2
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized (missing or invalid session)
- `500`: Server error

---

#### Start a New Conversation
**POST** `/api/conversations`

Create a new discussion between the current user and another user. If a discussion already exists, returns the existing one.

**Headers:**
- `Content-Type: application/json`
- Requires valid session cookie

**Request Body:**
```json
{
  "otherUserId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "user1Id": 1,
  "user2Id": 2,
  "user1": {
    "id": 1,
    "username": "john_doe",
    "name": "John",
    "surname": "Doe"
  },
  "user2": {
    "id": 2,
    "username": "jane_smith",
    "name": "Jane",
    "surname": "Smith"
  },
  "createdAt": "2025-11-30T10:00:00Z",
  "updatedAt": "2025-11-30T10:00:00Z"
}
```

**Status Codes:**
- `201`: Conversation created
- `200`: Existing conversation returned
- `400`: Invalid request (self-conversation or missing userId)
- `401`: Unauthorized
- `404`: Other user not found
- `500`: Server error

---

#### Get Messages in a Conversation
**GET** `/api/conversations/[id]`

Fetch all messages in a specific discussion. Verifies the current user is a participant.

**Path Parameters:**
- `id` (number): Discussion ID

**Headers:**
- Requires valid session cookie

**Response:**
```json
{
  "discussion": {
    "id": 1,
    "user1": {
      "id": 1,
      "username": "john_doe",
      "name": "John",
      "surname": "Doe"
    },
    "user2": {
      "id": 2,
      "username": "jane_smith",
      "name": "Jane",
      "surname": "Smith"
    },
    "createdAt": "2025-11-30T10:00:00Z",
    "updatedAt": "2025-11-30T15:30:00Z"
  },
  "messages": [
    {
      "id": 1,
      "content": "Hello!",
      "mediaType": null,
      "mediaUrl": null,
      "createdAt": "2025-11-30T10:05:00Z",
      "senderId": 1,
      "sender": {
        "id": 1,
        "username": "john_doe",
        "name": "John",
        "surname": "Doe"
      }
    },
    {
      "id": 2,
      "content": "Hi! How are you?",
      "mediaType": null,
      "mediaUrl": null,
      "createdAt": "2025-11-30T10:06:00Z",
      "senderId": 2,
      "sender": {
        "id": 2,
        "username": "jane_smith",
        "name": "Jane",
        "surname": "Smith"
      }
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid discussion ID
- `401`: Unauthorized
- `403`: User is not a participant in this discussion
- `404`: Discussion not found
- `500`: Server error

---

#### Send a Message
**POST** `/api/conversations/[id]`

Send a message in a discussion. Either `content` or `mediaUrl` is required.

**Path Parameters:**
- `id` (number): Discussion ID

**Headers:**
- `Content-Type: application/json`
- Requires valid session cookie

**Request Body:**
```json
{
  "content": "This is a message",
  "mediaType": "image",
  "mediaUrl": "https://example.com/image.jpg"
}
```

Or for text-only:
```json
{
  "content": "Just a text message"
}
```

**Response:**
```json
{
  "id": 3,
  "content": "This is a message",
  "mediaType": "image",
  "mediaUrl": "https://example.com/image.jpg",
  "createdAt": "2025-11-30T15:30:00Z",
  "updatedAt": "2025-11-30T15:30:00Z",
  "discussionId": 1,
  "senderId": 1,
  "sender": {
    "id": 1,
    "username": "john_doe",
    "name": "John",
    "surname": "Doe"
  }
}
```

**Status Codes:**
- `201`: Message created successfully
- `400`: Invalid request (missing content and media)
- `401`: Unauthorized
- `403`: User is not a participant in this discussion
- `404`: Discussion not found
- `500`: Server error

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Description of the error"
}
```

Common error codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing or invalid session)
- `403`: Forbidden (user doesn't have permission)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Examples

### JavaScript/Fetch

```typescript
// Get all conversations
const response = await fetch("/api/conversations", {
  method: "GET",
  credentials: "include", // Include cookies
});
const { conversations } = await response.json();

// Start a new conversation
const createRes = await fetch("/api/conversations", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ otherUserId: 2 }),
});
const conversation = await createRes.json();

// Get messages in a conversation
const messagesRes = await fetch(`/api/conversations/${conversation.id}`, {
  credentials: "include",
});
const { discussion, messages } = await messagesRes.json();

// Send a message
const sendRes = await fetch(`/api/conversations/${conversation.id}`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Hello there!",
  }),
});
const newMessage = await sendRes.json();
```

### Search Users

```typescript
const searchRes = await fetch("/api/users/search?q=john", {
  credentials: "include",
});
const { users } = await searchRes.json();
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting in production for `/api/users/search` and message endpoints.

---

## Future Enhancements

- [ ] Add pagination to conversations and messages
- [ ] Implement real-time messaging via WebSockets
- [ ] Add message deletion and editing
- [ ] Add typing indicators
- [ ] Implement read receipts
- [ ] Add file upload support for media
- [ ] Add rate limiting
- [ ] Add conversation deletion
- [ ] Add user blocking functionality
