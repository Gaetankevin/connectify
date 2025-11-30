"use client";

import { useState, useEffect, useRef } from "react";
import {
  getConversations,
  searchUsers,
  createConversation,
  getMessages,
  sendMessage,
} from "@/lib/api-client";
import type { Conversation, User, Message, Discussion } from "@/lib/api-client";

export default function ChatLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newConvSearch, setNewConvSearch] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const [lastNotifiedMessageId, setLastNotifiedMessageId] = useState<
    number | null
  >(null);

  // Close mobile panel when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesRef.current = messages;
  }, [messages]);

  // Request notification permission on mount (graceful)
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // helper: play a short beep using WebAudio
  const playBeep = () => {
    try {
      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        try {
          ctx.close();
        } catch (e) {}
      }, 150);
    } catch (e) {
      // ignore
    }
  };

  const notifyNewMessage = (msg: Message, otherName?: string) => {
    // avoid notifying about messages we've already notified
    if (lastNotifiedMessageId === msg.id) return;
    setLastNotifiedMessageId(msg.id);

    // show desktop notification if permitted
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const title = otherName ? otherName : "Nouveau message";
        const body = msg.content ? msg.content : "Fichier joint";
        const n = new Notification(title, { body, silent: true });
        n.onclick = () => window.focus();
      } catch (e) {
        // ignore
      }
    }

    // play a beep
    playBeep();
  };

  // Polling: refresh conversations every 1s to simulate near-instant messaging
  // Use "silent" mode so we don't toggle the global `loading` state or
  // otherwise notify the user — updates should be visual only.
  useEffect(() => {
    const iv = setInterval(() => {
      fetchConversations(true);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Poll messages for the selected conversation every 1s
  useEffect(() => {
    if (!selectedConvId) return;
    let mounted = true;
    const checker = async () => {
      try {
        const { discussion: d, messages: newMessages } = await getMessages(
          selectedConvId
        );
        if (!mounted) return;

        // if new last message exists and is different => update + possibly notify
        const last = newMessages.length
          ? newMessages[newMessages.length - 1]
          : null;
        const prevLast = messagesRef.current.length
          ? messagesRef.current[messagesRef.current.length - 1]
          : null;

        // update state always to keep in sync
        setDiscussion(d);
        setMessages(newMessages);

        if (last && (!prevLast || last.id !== prevLast.id)) {
          // If the last message is from the other user, notify
          const conv = conversations.find((c) => c.id === selectedConvId);
          if (conv && last.senderId === conv.otherUser.id) {
            notifyNewMessage(last, conv.otherUser.name);
          }
        }
      } catch (e) {
        // ignore polling errors
      }
    };

    // run immediately then every second
    checker();
    const iv = setInterval(checker, 1000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [selectedConvId, conversations]);

  // Create object URL for preview when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [selectedFile]);

  // fetchConversations supports a silent mode (used by the poller) to avoid
  // toggling `loading` or otherwise creating visual noise while the list
  // refreshes in the background.
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const convs = await getConversations();
      setConversations(convs);
      if (convs.length > 0 && !selectedConvId) {
        setSelectedConvId(convs[0].id);
      }
    } catch (err) {
      if (!silent) setError("Failed to load conversations");
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const { discussion, messages } = await getMessages(convId);
      setDiscussion(discussion);
      setMessages(messages);
    } catch (err) {
      setError("Failed to load messages");
      console.error(err);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchedUsers([]);
      return;
    }
    try {
      const users = await searchUsers(query);
      setSearchedUsers(users);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleStartConversation = async (userId: number) => {
    try {
      setSendingMessage(true);
      const conv = await createConversation(userId);

      // Refresh conversations
      await fetchConversations();

      // Select the new conversation
      setSelectedConvId(conv.id);
      setShowNewConvModal(false);
      setNewConvSearch("");
      setSearchedUsers([]);
    } catch (err) {
      setError("Failed to create conversation");
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedConvId || sendingMessage) return;
    if (!messageInput.trim() && !selectedFile) return;

    try {
      setSendingMessage(true);
      const newMsg = await sendMessage(selectedConvId, {
        content: messageInput.trim() || undefined,
        file: selectedFile || undefined,
      });

      // Add message to state
      setMessages([...messages, newMsg]);
      setMessageInput("");
      setSelectedFile(null);

      // Refresh conversations to update "last message"
      await fetchConversations();
    } catch (err) {
      setError("Failed to send message");
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Left Sidebar: Conversations */}
  <div className="w-full md:w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewConvModal(true)}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
              title="New conversation"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConvId(conv.id);
                  // if on small screen, open the messages panel as an overlay
                  if (
                    typeof window !== "undefined" &&
                    window.innerWidth < 768
                  ) {
                    setMobileOpen(true);
                  }
                }}
                className={`w-full text-left px-4 py-3 transition ${
                  selectedConvId === conv.id
                    ? "bg-indigo-50 border-l-4 border-indigo-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="font-semibold text-gray-900 text-sm">
                  {conv.otherUser.name} {conv.otherUser.surname}
                </p>
                <p className="text-xs text-gray-500">
                  @{conv.otherUser.username}
                </p>
                <p className="text-xs text-gray-600 truncate mt-1">
                  {conv.lastMessage?.content || "No messages yet"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {conv.lastMessage
                    ? formatTime(conv.lastMessage.createdAt)
                    : ""}
                </p>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Right Content Area: Messages */}
      {/* Backdrop for mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden ${
          mobileOpen ? "block" : "hidden"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`transform transition-transform duration-300 ease-in-out bg-white z-40 flex flex-col h-full md:relative md:transform-none md:flex md:flex-1 ${
          mobileOpen
            ? "fixed inset-0 translate-x-0"
            : "fixed inset-0 translate-x-full md:translate-x-0"
        }`}
        style={
          {
            // On desktop we want flex behavior; on mobile the element is an overlay fixed to inset-0
          }
        }
      >
        {selectedConv && discussion ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between">
              {/* Mobile back button */}
              <div className="flex items-center gap-3 md:hidden">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                  aria-label="Back to conversations"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-gray-900 sm:hidden">
                  {selectedConv.otherUser.name} {selectedConv.otherUser.surname}
                </h5>
                <p className="text-xs text-gray-500 ">
                  @{selectedConv.otherUser.username}
                </p>
              </div>
            </div>

            {/* Messages Area + Input (fixed bottom) */}
            <div className="flex-1 flex flex-col overflow-y-auto min-h-0 min-w-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center text-gray-500 py-8">
                    <p>Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === selectedConv.otherUser.id
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          msg.senderId === selectedConv.otherUser.id
                            ? "bg-gray-200 text-gray-900"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        {msg.content && (
                          <p className="text-sm break-words">{msg.content}</p>
                        )}
                        {msg.mediaUrl && (
                          <div className="mt-2">
                            {msg.mediaType?.startsWith("image") ? (
                              <img
                                src={msg.mediaUrl}
                                alt="Message attachment"
                                className="max-w-xs rounded"
                              />
                            ) : (
                              <a
                                href={msg.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs underline"
                              >
                                Download attachment
                              </a>
                            )}
                          </div>
                        )}
                        <p className="text-xs mt-1 opacity-70">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - stays at bottom */}
              <div className=" bg-white px-6 py-4">
                {error && (
                  <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
                    {error}
                  </div>
                )}

                {/* Preview area for selected media */}
                {selectedFile && previewUrl && (
                  <div className="mb-3">
                      <div className="flex flex-col sm:flex-row items-start gap-3">
                        <div className="max-w-xs max-h-48 overflow-hidden rounded w-full sm:w-48">
                          {selectedFile.type.startsWith("image/") ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="object-cover w-full sm:w-48 h-32"
                            />
                          ) : selectedFile.type.startsWith("video/") ? (
                            <video
                              src={previewUrl}
                              controls
                              className="w-full sm:w-48 h-32 object-cover"
                            />
                          ) : (
                            <div className="w-full sm:w-48 h-32 flex items-center justify-center bg-gray-50rounded text-sm text-gray-600">
                              <div className="px-2 text-center">
                                <div className="font-semibold truncate">
                                  {selectedFile.name}
                                </div>
                                <div className="text-xs opacity-70">
                                  {(selectedFile.size / 1024).toFixed(1)} KB
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {selectedFile.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedFile.type || "Unknown type"}
                            </div>
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="text-sm text-gray-500 hover:text-gray-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={sendingMessage}
                    className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  {/* File upload button */}
                  <label className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,video/*,application/pdf,application/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setSelectedFile(f);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        // trigger file input click
                        const input = (e.currentTarget as HTMLElement)
                          .closest("label")
                          ?.querySelector(
                            "input[type=file]"
                          ) as HTMLInputElement | null;
                        input?.click();
                      }}
                      className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                      title="Attach file"
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 10-5.656-5.656L6.343 10.172"
                        />
                      </svg>
                    </button>
                  </label>
                  <button
                    type="submit"
                    aria-label={sendingMessage ? "Envoi en cours" : "Envoyer"}
                    title={sendingMessage ? "Envoi en cours" : "Envoyer"}
                    disabled={
                      sendingMessage || (!messageInput.trim() && !selectedFile)
                    }
                    className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {sendingMessage ? (
                      // spinner while sending
                      <svg
                        className="w-5 h-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="rgba(255,255,255,0.25)"
                          strokeWidth="4"
                        />
                        <path
                          d="M22 12a10 10 0 00-10-10"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      // paper plane icon
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          d="M22 2L11 13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22 2l-7 20  -4-9-9-4 20-7z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="rgba(255,255,255,0.03)"
                        />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-gray-500 text-lg">
                Select a conversation to start
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Start New Conversation
              </h3>
              <button
                onClick={() => {
                  setShowNewConvModal(false);
                  setNewConvSearch("");
                  setSearchedUsers([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search by name or username..."
                value={newConvSearch}
                onChange={(e) => {
                  setNewConvSearch(e.target.value);
                  handleSearchUsers(e.target.value);
                }}
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Users List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
              {searchedUsers.length > 0 ? (
                searchedUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartConversation(user.id)}
                    disabled={sendingMessage}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between disabled:opacity-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {user.name} {user.surname}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))
              ) : newConvSearch.length > 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No users found
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">
                  Start typing to search users...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
