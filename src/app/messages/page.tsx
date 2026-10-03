"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MessageSquare, Send, User, Clock, Search, ArrowLeft, ShieldCheck } from "lucide-react";

function ChatContent() {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversationId");
  const initialRecipientId = searchParams.get("recipientId");
  const initialItemId = searchParams.get("itemId");

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId);
  const [activeConvData, setActiveConvData] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else if (initialRecipientId) {
      // Start chat with recipient
      startChatWithRecipient();
    }
  }, [activeConvId, initialRecipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (!activeConvId && data.conversations?.length > 0 && !initialRecipientId) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function startChatWithRecipient() {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: initialRecipientId,
          itemId: initialItemId,
          text: "Hi! I'm interested in borrowing your item listed on campus.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        fetchConversations();
        setActiveConvId(data.message.conversationId);
      }
    } catch (err) {
      console.error("Start chat error:", err);
    }
  }

  async function fetchMessages(convId: string) {
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConvData(data.conversation);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !activeConvId) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          text,
        }),
      });

      if (res.ok) {
        setText("");
        fetchMessages(activeConvId);
        fetchConversations();
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
      {/* Left Sidebar: Conversations List */}
      <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/70 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-base font-bold text-slate-900">Campus Messages</h2>
          <p className="text-[11px] text-slate-500">In-app chat between borrowers & lenders</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No active conversations.</div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.borrower || conv.owner;
              const lastMsg = conv.messages?.[0];
              const isSelected = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition ${
                    isSelected ? "bg-white border-l-4 border-emerald-600 shadow-xs" : "hover:bg-slate-100/60"
                  }`}
                >
                  <img
                    src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-full object-cover bg-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{otherUser.name}</span>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {conv.item && (
                      <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                        Item: {conv.item.title}
                      </span>
                    )}
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastMsg ? lastMsg.text : "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Chat Window */}
      <div className="md:col-span-8 flex flex-col bg-white">
        {activeConvData ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={(activeConvData.borrower || activeConvData.owner).avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`}
                  className="w-9 h-9 rounded-full object-cover bg-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {(activeConvData.borrower || activeConvData.owner).name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {(activeConvData.borrower || activeConvData.owner).department}
                  </span>
                </div>
              </div>

              {activeConvData.item && (
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold">
                  <img src={activeConvData.item.image} className="w-6 h-6 rounded-md object-cover" />
                  <span className="truncate max-w-[160px]">{activeConvData.item.title}</span>
                </div>
              )}
            </div>

            {/* Messages Transcript */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[420px] bg-slate-50/30">
              {messages.map((msg) => {
                const isMe = msg.sender.id !== (activeConvData.borrower || activeConvData.owner).id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-xs ${
                        isMe
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className={`text-[9px] block text-right font-medium ${isMe ? "text-emerald-200" : "text-slate-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center gap-2 bg-white">
              <input
                type="text"
                placeholder="Type your message to organize pickup..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-12 h-12 text-slate-300" />
            <p className="text-xs font-bold text-slate-600">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="h-96 bg-slate-200 animate-pulse rounded-3xl"></div>}>
          <ChatContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
