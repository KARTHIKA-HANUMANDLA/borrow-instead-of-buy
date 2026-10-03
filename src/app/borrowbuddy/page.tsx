"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ItemCard from "@/components/items/ItemCard";
import { Bot, Send, Sparkles, User, ArrowRight } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  items?: any[];
}

export default function BorrowBuddyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello! I'm BorrowBuddy, your intelligent campus borrowing assistant. Tell me what lab experiment, exam, or project you're working on, and I'll find available items on campus!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "I need something for my IoT robotics project",
    "Preparing for DBMS 3rd sem mid-term exam",
    "Formal clothes for campus placement interview",
    "DSLR camera for cultural fest photo coverage",
  ];

  async function handleSend(promptText?: string) {
    const query = promptText || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/borrowbuddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "assistant",
          text: data.reply,
          items: data.items,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error("BorrowBuddy error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">AI Assistant</span>
              <h1 className="text-2xl font-extrabold">BorrowBuddy Campus Assistant</h1>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Ask BorrowBuddy to recommend lab equipment, study manuals, tools, or event items based on your project description!
          </p>
        </div>

        {/* Sample Prompts */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Sample Student Queries:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold transition shadow-xs"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Chat Transcript Area */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-3xl text-xs space-y-3 shadow-xs ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {m.sender === "assistant" ? (
                      <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-emerald-200 shrink-0" />
                    )}
                    <span className="font-bold">{m.sender === "assistant" ? "BorrowBuddy" : "You"}</span>
                  </div>

                  <p className="leading-relaxed">{m.text}</p>

                  {/* Render matched item cards if returned by assistant */}
                  {m.items && m.items.length > 0 && (
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {m.items.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-4 rounded-3xl text-xs text-slate-500 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>BorrowBuddy is searching campus listings...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type what you need for your lab, project, or exam..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl text-xs border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
