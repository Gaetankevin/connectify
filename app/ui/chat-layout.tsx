"use client";

import { ModeToggle } from "@/components/swetch-theme";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Send,
  Plus,
  Search,
  Paperclip,
  X,
  MessageCircle,
  Settings,
  Divide,
} from "lucide-react";
import {
  getConversations,
  searchUsers,
  createConversation,
  getMessages,
  sendMessage,
} from "@/lib/api-client";
import type { Conversation, User, Message, Discussion } from "@/lib/api-client";
import { SettingsSidebar } from "@/components/settings-sidebar";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const lastMessageIdRef = useRef<number | null>(null);
  const idlePollsRef = useRef<number>(0);
  const pollTimerRef = useRef<number | null>(null);
  const [lastNotifiedMessageId, setLastNotifiedMessageId] = useState<
    number | null
  >(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    email: string;
    name: string;
    surname: string;
    isDeactivated?: boolean;
    deletedAt?: string | null;
    profileImage?: string | null;
  } | null>(null);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    fetchConversations();
    // Fetch current user data
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

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
    } catch (e) {}
  };

  const notifyNewMessage = (msg: Message, otherName?: string) => {
    if (lastNotifiedMessageId === msg.id) return;
    setLastNotifiedMessageId(msg.id);

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
      } catch (e) {}
    }
    playBeep();
  };

  // Note: Removed automatic conversation list refresh every 10 seconds.
  // The message polling (delta polling in the next useEffect) is sufficient.
  // Frequent conversation refetches cause selectedConvId to reset when list order changes.
  // Users can manually refresh by navigating or sending messages (which calls fetchConversations).

  useEffect(() => {
    if (!selectedConvId) return;

    let mounted = true;

    // initial full fetch (discussion + messages)
    const doInitialFetch = async () => {
      try {
        const { discussion: d, messages: msgs } = await getMessages(
          selectedConvId
        );
        if (!mounted) return;
        setDiscussion(d ?? null);
        setMessages(msgs);
        messagesRef.current = msgs;
        const last = msgs.length ? msgs[msgs.length - 1].id : null;
        setLastMessageId(last);
        lastMessageIdRef.current = last;
        idlePollsRef.current = 0;
      } catch (err) {
        console.error("Initial fetch failed:", err);
      }
    };

    // checker retrieves only new messages after lastMessageId (delta)
    const checker = async () => {
      try {
        const after = lastMessageIdRef.current ?? 0;
        const res = await getMessages(
          selectedConvId,
          after && after > 0 ? after : undefined
        );

        // res may contain discussion (on full fetch) or only messages (delta)
        if (!mounted) return;

        if (res.discussion) {
          setDiscussion(res.discussion);
        }

        const newMessages = res.messages || [];
        if (newMessages.length > 0) {
          // append deltas to current messages
          const merged = [...messagesRef.current, ...newMessages];
          setMessages(merged);
          messagesRef.current = merged;

          const last = newMessages[newMessages.length - 1];
          setLastMessageId(last.id);
          lastMessageIdRef.current = last.id;
          idlePollsRef.current = 0;

          // notify if message from other user
          const conv = conversations.find((c) => c.id === selectedConvId);
          if (conv && last.senderId === conv.otherUser.id) {
            notifyNewMessage(last, conv.otherUser.name);
          }
        } else {
          // no new messages
          idlePollsRef.current = (idlePollsRef.current || 0) + 1;
        }
      } catch (err) {
        console.error("Delta fetch failed:", err);
      }
    };

    // adaptive scheduler using setTimeout so we can vary intervals
    const scheduleNext = () => {
      // Determine delay based on visibility and recent activity
      const visible = typeof document !== "undefined" ? document.visibilityState === "visible" : true;
      let delay = visible ? 2000 : 15000;
      if (visible && idlePollsRef.current > 10) delay = 10000; // backoff after many idle polls

      pollTimerRef.current = window.setTimeout(async () => {
        if (!mounted) return;
        await checker();
        scheduleNext();
      }, delay) as unknown as number;
    };

    // start
    doInitialFetch().then(() => {
      if (!mounted) return;
      scheduleNext();
    });

    return () => {
      mounted = false;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [selectedConvId, conversations]);

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

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const convs = await getConversations();
      setConversations(convs);
      if (convs.length > 0 && !selectedConvId) {
        setSelectedConvId(convs[0].id);
      }
    } catch (err) {
      if (!silent) toast.error("Impossible de charger les conversations");
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/users/me");
      if (!response.ok) throw new Error("Failed to fetch user");
      const user = await response.json();
      setCurrentUser(user);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const { discussion, messages } = await getMessages(convId);
      setDiscussion(discussion ?? null);
      setMessages(messages);
      messagesRef.current = messages;
      const last = messages.length ? messages[messages.length - 1].id : null;
      setLastMessageId(last);
      lastMessageIdRef.current = last;
    } catch (err) {
      toast.error("Impossible de charger les messages");
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
      const toastId = toast.loading("Création de la conversation...");

      const conv = await createConversation(userId);
      await fetchConversations();

      setSelectedConvId(conv.id);
      setShowNewConvModal(false);
      setNewConvSearch("");
      setSearchedUsers([]);

      toast.dismiss(toastId);
      toast.success("Conversation créée ✓");
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Impossible de créer la conversation";
      toast.error(errorMsg);
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
      const toastId = toast.loading("Envoi du message...");

      const newMsg = await sendMessage(selectedConvId, {
        content: messageInput.trim() || undefined,
        file: selectedFile || undefined,
      });
      // append sent message and update lastMessageId
      setMessages((prev) => {
        const merged = [...prev, newMsg];
        messagesRef.current = merged;
        return merged;
      });
      setLastMessageId(newMsg.id);
      lastMessageIdRef.current = newMsg.id;
      setMessageInput("");
      setSelectedFile(null);

      await fetchConversations();

      toast.dismiss(toastId);
      toast.success("Message envoyé ✓");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Impossible d'envoyer le message";
      toast.error(errorMsg);
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

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;

    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="h-screen flex bg-slate-950 overflow-hidden">
      {/* Left Sidebar: Conversations */}
      <div className="w-full md:w-80 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 overflow-y-auto flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Connectify
              </h2>
              <p className="text-xs text-slate-400">Messages</p>
            </div>
            <div className="flex gap-2">
              <ModeToggle />
              <Button
                onClick={() => setShowNewConvModal(true)}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9"
                title="Nouvelle conversation"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setSettingsPanelOpen(true)}
                size="icon"
                className="bg-slate-700 hover:bg-slate-600 h-9 w-9 text-slate-300"
                title="Paramètres"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Chercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    if (
                      typeof window !== "undefined" &&
                      window.innerWidth < 768
                    ) {
                      setMobileOpen(true);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    selectedConvId === conv.id
                      ? "bg-indigo-600/20 border border-indigo-500"
                      : "hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 text-sm truncate">
                        {conv.otherUser.name} {conv.otherUser.surname}
                      </p>
                      <p className="text-xs text-slate-400">
                        @{conv.otherUser.username}
                      </p>
                      <p className="text-xs text-slate-300 truncate mt-1 line-clamp-2">
                        {conv.lastMessage?.content || "Aucun message"}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs shrink-0 mt-1"
                    >
                      {formatTime(
                        conv.lastMessage?.createdAt || conv.updatedAt
                      )}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-slate-400">Aucune conversation</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Content Area: Messages */}
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Chat Container */}
      <div
        className={`transform transition-transform duration-300 ease-in-out bg-slate-900 z-40 flex flex-col h-full md:relative md:flex md:flex-1 ${
          mobileOpen
            ? "fixed inset-0 translate-x-0"
            : "fixed inset-0 translate-x-full md:translate-x-0"
        }`}
      >
        {selectedConv && discussion ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="md:hidden text-slate-300 hover:bg-slate-700"
                  aria-label="Retour"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>
                <div>
                  <h3 className="font-semibold text-slate-100">
                    {selectedConv.otherUser.name}{" "}
                    {selectedConv.otherUser.surname}
                  </h3>
                  <p className="text-xs text-slate-400">
                    @{selectedConv.otherUser.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div className="space-y-3">
                      <MessageCircle className="h-12 w-12 mx-auto text-slate-600" />
                      <div>
                        <p className="text-slate-100 font-medium">
                          Commencez la conversation
                        </p>
                        <p className="text-xs text-slate-400">
                          Envoyez votre premier message
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId !== selectedConv.otherUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Avatar on left (recipient's avatar when message is from other user) */}
                        {!isOwn && (
                          <div className="flex-shrink-0">
                            {selectedConv.otherUser?.profileImage ? (
                              <img
                                src={selectedConv.otherUser.profileImage}
                                alt={selectedConv.otherUser.name}
                                className="w-8 h-8 rounded-full object-cover border border-indigo-500"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                {selectedConv.otherUser?.name?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 shadow-sm ${
                            isOwn
                              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                              : "bg-slate-700 text-slate-100"
                          }`}
                        >
                          {msg.content && (
                            <p className="text-sm break-words leading-relaxed">
                              {msg.content}
                            </p>
                          )}
                          {msg.mediaUrl && (
                            <div className="mt-2">
                              {msg.mediaType?.startsWith("image") ? (
                                <img
                                  src={msg.mediaUrl}
                                  alt="Attachment"
                                  className="max-w-xs rounded-xl"
                                />
                              ) : (
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs underline opacity-80 hover:opacity-100 inline-flex items-center gap-1"
                                >
                                  <Paperclip className="w-3 h-3" /> Télécharger
                                </a>
                              )}
                            </div>
                          )}
                          <p className="text-xs mt-1 opacity-70">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>

                        {/* Avatar on right (current user's avatar when message is from them) */}
                        {isOwn && (
                          <div className="flex-shrink-0">
                            {currentUser?.profileImage ? (
                              <img
                                src={currentUser.profileImage}
                                alt={currentUser.name}
                                className="w-8 h-8 rounded-full object-cover border border-indigo-500"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                {currentUser?.name?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input Area */}
            <div className="border-t border-slate-700 bg-slate-800 p-4 space-y-3">
              {/* Preview area for selected media */}
              {selectedFile && previewUrl && (
                <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                  <div className="flex gap-3 items-start">
                    {/* Thumbnail Container */}
                    <div className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center">
                      {selectedFile.type.startsWith("image/") ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : selectedFile.type.startsWith("video/") ? (
                        <div className="relative w-full h-full">
                          <video
                            src={previewUrl}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-white gap-1 px-2">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-xs text-center line-clamp-2">
                            {selectedFile.name.split(".").pop()?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Prêt à envoyer
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                      className="flex-shrink-0 h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-slate-600/50"
                      title="Supprimer"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3"
              >
                <Input
                  type="text"
                  placeholder="Écrivez un message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={sendingMessage}
                  className="flex-1 min-w-0 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-600"
                />

                {/* File upload button */}
                <label className="flex items-center">
                  <input
                    type="file"
                    accept="image/*,video/*,application/pdf,application/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setSelectedFile(f);
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      const input = (e.currentTarget as HTMLElement)
                        .closest("label")
                        ?.querySelector(
                          "input[type=file]"
                        ) as HTMLInputElement | null;
                      input?.click();
                    }}
                    className="text-slate-400 hover:text-slate-100 hover:bg-slate-700 h-10 w-10"
                    title="Joindre un fichier"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </label>

                {/* Send button */}
                <Button
                  type="submit"
                  disabled={
                    sendingMessage || (!messageInput.trim() && !selectedFile)
                  }
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white h-10 w-10 p-0"
                  title={sendingMessage ? "Envoi en cours" : "Envoyer"}
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <MessageCircle className="h-16 w-16 mx-auto text-slate-600" />
              <div>
                <p className="text-slate-200 font-medium text-lg">
                  Sélectionnez une conversation
                </p>
                <p className="text-slate-400 text-sm">
                  Ou créez-en une nouvelle
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <Dialog open={showNewConvModal} onOpenChange={setShowNewConvModal}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              Nouvelle conversation
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Recherchez et commencez une conversation avec un utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou username..."
                value={newConvSearch}
                onChange={(e) => {
                  setNewConvSearch(e.target.value);
                  handleSearchUsers(e.target.value);
                }}
                autoFocus
                className="pl-9 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Users List */}
            <ScrollArea className="max-h-96">
              <div className="space-y-2 pr-4">
                {searchedUsers.length > 0 ? (
                  searchedUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleStartConversation(user.id)}
                      disabled={sendingMessage}
                      className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-100 text-sm">
                            {user.name} {user.surname}
                          </p>
                          <p className="text-xs text-slate-400">
                            @{user.username}
                          </p>
                        </div>
                        <svg
                          className="w-5 h-5 text-slate-400"
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
                      </div>
                    </button>
                  ))
                ) : newConvSearch.length > 0 ? (
                  <div className="text-center py-6">
                    <p className="text-slate-400 text-sm">
                      Aucun utilisateur trouvé
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-400 text-sm">
                      Commencez à taper pour rechercher...
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
        user={currentUser || undefined}
        onLogout={() => {
          // Redirect to logout
          window.location.href = "/api/auth/logout";
        }}
      />
    </div>
  );
}
