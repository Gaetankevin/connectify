/**
 * Client-side helpers for making API calls.
 * These functions handle HTTP requests to the backend API.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  surname: string;
}

export interface Message {
  id: number;
  content: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  createdAt: string;
  senderId: number;
  sender: {
    id: number;
    username: string;
    name: string;
    surname: string;
  };
}

export interface Conversation {
  id: number;
  otherUser: User;
  createdAt: string;
  updatedAt: string;
  lastMessage: Message | null;
}

export interface Discussion {
  id: number;
  user1: User;
  user2: User;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// User API
// ============================================

/**
 * Search for users by query string
 */
export async function searchUsers(query: string): Promise<User[]> {
  const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to search users");
  }

  const data = await response.json();
  return data.users;
}

// ============================================
// Conversations API
// ============================================

/**
 * Fetch all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/conversations", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }

  const data = await response.json();
  return data.conversations;
}

/**
 * Start a new conversation with another user
 */
export async function createConversation(otherUserId: number): Promise<Discussion> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otherUserId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create conversation");
  }

  return response.json();
}

/**
 * Fetch all messages in a conversation
 */
export async function getMessages(
  discussionId: number
): Promise<{ discussion: Discussion; messages: Message[] }> {
  const response = await fetch(`/api/conversations/${discussionId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  return response.json();
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  discussionId: number,
  message: {
    content?: string;
    mediaType?: string;
    mediaUrl?: string;
    file?: File | Blob | null;
  }
): Promise<Message> {
  let response: Response;
  if (message.file) {
    const fd = new FormData();
    if (message.content) fd.append("content", message.content);
    // append the file under the key 'file'
    fd.append("file", message.file as any, (message.file as any).name || "upload");

    response = await fetch(`/api/conversations/${discussionId}`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
  } else {
    response = await fetch(`/api/conversations/${discussionId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  }

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}
