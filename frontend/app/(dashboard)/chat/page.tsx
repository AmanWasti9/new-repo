"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSocket, disconnectSocket } from "@/app/libs/socket";
import { chatApi } from "@/service/chat";
import { MessageSquare, Send, User as UserIcon, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
  receiver: {
    id: string;
    name: string;
  };
}

interface Conversation {
  user: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
  lastMessageDate: string;
}

function ChatContent() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    const onReceiveMessage = (message: Message) => {
      if (selectedUser && (message.sender.id === selectedUser.id || message.sender.id === user?.userId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
      fetchConversations();
    };

    const onMessageSent = (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      fetchConversations();
    };

    const onLoadMessages = (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
      setLoadingMessages(false);
    };

    const onLoadConversations = (loadedConversations: Conversation[]) => {
      setConversations(loadedConversations);
      setLoading(false);
    };

    socket.on("receiveMessage", onReceiveMessage);
    socket.on("messageSent", onMessageSent);
    socket.on("loadMessages", onLoadMessages);
    socket.on("loadConversations", onLoadConversations);

    fetchConversations();

    if (initialUserId) {
      handleSelectUser(initialUserId);
    }

    return () => {
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("messageSent", onMessageSent);
      socket.off("loadMessages", onLoadMessages);
      socket.off("loadConversations", onLoadConversations);
    };
  }, [token, initialUserId, selectedUser?.id]);

  const fetchConversations = () => {
    socketRef.current?.emit("getConversations");
  };

  const handleSelectUser = async (userId: string, name?: string) => {
    setLoadingMessages(true);
    // If we don't have the name (e.g. from query param), it will be loaded with messages or we could fetch user info
    setSelectedUser({ id: userId, name: name || "User" });
    socketRef.current?.emit("getMessages", { otherUserId: userId });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    socketRef.current?.emit("sendMessage", {
      receiverId: selectedUser.id,
      content: newMessage,
    });

    setNewMessage("");
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations yet.</p>
              <p className="text-sm mt-2">Start chatting by clicking 'Chat with Owner' on a car card!</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => handleSelectUser(conv.user.id, conv.user.name)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-blue-50 transition-colors border-b border-gray-50 ${selectedUser?.id === conv.user.id ? "bg-blue-100/50 border-r-4 border-r-blue-600" : ""
                  }`}
              >
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {conv.user.name.charAt(0)}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-900 truncate">{conv.user.name}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(conv.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                {/* <span className="text-xs text-green-500 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Online
                </span> */}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {loadingMessages ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p>Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender.id === user?.userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div
                          className={`text-[10px] mt-1 ${isMe ? "text-blue-100" : "text-gray-400"
                            } text-right`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/10">
            <div className="p-6 bg-white rounded-full shadow-sm mb-4">
              <MessageSquare className="h-12 w-12 text-blue-200" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">Your Messages</h3>
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
