"use client";

import { useState } from "react";
import { useHealthAI } from "@/hooks/useHealthAI";
import { Send, Bot, Loader2, X, MessageSquare } from "lucide-react";

export default function HealthChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const { ready, loading, askHealthQuestion } = useHealthAI();
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !ready) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    
    setIsTyping(true);
    const botResponse = await askHealthQuestion(userText);
    setIsTyping(false);
    
    setMessages((prev) => [...prev, { role: "bot", text: botResponse }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all flex items-center gap-2 group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-medium">
            Ask Health AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">Health Assistant (In-Browser AI)</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-blue-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10 text-sm">
                <Bot className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>Hello! I'm your local AI health assistant. I run entirely in your browser.</p>
                {!ready && loading && (
                  <p className="mt-2 flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading medical model...
                  </p>
                )}
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${
                  msg.role === "user"
                    ? "bg-blue-100 text-blue-900 self-end rounded-br-none"
                    : "bg-white text-gray-800 self-start rounded-bl-none border border-gray-200 shadow-sm"
                } p-3 rounded-2xl text-xs max-w-[85%]`}
              >
                {msg.text}
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-white border border-gray-200 self-start p-3 rounded-2xl text-xs flex items-center gap-2 text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={!ready}
              placeholder={ready ? "Type a health question..." : "Loading model..."}
              className="flex-1 text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!ready || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
