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

  if (response.status === 401 || response.status === 403) {
    // If the session/cookie disappeared, force a client redirect to login.
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

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

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

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

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

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

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  return response.json();
}

/**
 * Send a message in a conversation.
 * If a file is provided, upload it to Vercel Blob first, then create the message with mediaUrl.
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
  let finalMediaUrl: string | null = null;
  let finalMediaType: string | null = null;

  // If a file is provided, upload it to Vercel Blob using client-side upload
  if (message.file && typeof window !== "undefined") {
    try {
      const { upload } = await import("@vercel/blob/client");
      const file = message.file as File;
      
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/uploads",
      });

      finalMediaUrl = blob.url;
      finalMediaType = file.type || "application/octet-stream";
      console.log("File uploaded to Vercel Blob:", finalMediaUrl);
    } catch (err) {
      console.error("Error uploading file to Vercel Blob:", err);
      throw new Error("Failed to upload file");
    }
  } else if (message.mediaUrl) {
    finalMediaUrl = message.mediaUrl;
    finalMediaType = message.mediaType || null;
  }

  // Create the message with the uploaded media URL (if any)
  const response = await fetch(`/api/conversations/${discussionId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: message.content || null,
      mediaUrl: finalMediaUrl || null,
      mediaType: finalMediaType || null,
    }),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to send message");
  }

  return response.json();
}
