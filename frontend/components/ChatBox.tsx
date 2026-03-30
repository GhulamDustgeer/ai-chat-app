"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage,loadHistory } from "@/lib/api";


type Message = {
  role: "user" | "ai";
  text: string;
};

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Add this useEffect below your existing one
useEffect(() => {
  const fetchHistory = async () => {
    try {
      const history = await loadHistory();
      const formatted = history.map((m) => ({
        role: m.role as "user" | "ai",
        text: m.text,
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Could not load history", err);
    }
  };
  fetchHistory();
}, []);
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setError("");

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessage(input);
      const aiMessage: Message = { role: "ai", text: reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <button
          onClick={clearChat}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 mt-20">
            Send a message to start chatting...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xl px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-blue-600 ml-auto text-right"
                : "bg-gray-800 mr-auto text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-800 max-w-xl px-4 py-3 rounded-2xl text-sm text-gray-400 animate-pulse">
            Thinking...
          </div>
        )}
        {error && (
          <div className="bg-red-900 text-red-300 max-w-xl px-4 py-3 rounded-2xl text-sm">
            ⚠️ {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-3 rounded-xl text-sm font-medium transition"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}