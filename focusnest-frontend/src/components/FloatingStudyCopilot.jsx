import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  Bot,
  User,
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const QUICK_PROMPTS = [
  "Explain this formula simply",
  "Give me a mnemonic to remember this",
  "Summarize key concepts",
  "Generate 3 practice questions",
];

export default function FloatingStudyCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("focusnest_copilot_chat");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const location = useLocation();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Derive human-readable page context
  const getContextLabel = () => {
    const path = location.pathname;
    if (path.includes("calendar")) return "Calendar & Deadlines";
    if (path.includes("revise")) return "Flashcards Revision";
    if (path.includes("mcq-test")) return "MCQ Practice Test";
    if (path.includes("board")) return "Kanban Workflow";
    if (path.includes("todays-page")) return "Today's Focus & Pomodoro";
    if (path.includes("profile")) return "Student Profile";
    return "Dashboard";
  };

  const contextLabel = getContextLabel();

  // Persist session messages
  useEffect(() => {
    try {
      sessionStorage.setItem("focusnest_copilot_chat", JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (textToSend) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isLoading) return;

    const userMsg = { role: "user", content: message, timestamp: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Map history for backend API
      const historyPayload = newHistory.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextStr = `${contextLabel} page (Student: ${user?.name || "Student"})`;
      const res = await api.aiCopilot(message, historyPayload, contextStr);

      const botReply = res.reply || "I'm here to help! Could you clarify your question?";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply, timestamp: Date.now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I had trouble reaching the AI service. Please check your internet connection or try again in a moment.",
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem("focusnest_copilot_chat");
    } catch {
      // ignore
    }
  };

  // Helper to format simple markdown (bold, lists, code)
  const renderFormattedText = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check if bullet point
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const isHeader = line.trim().startsWith("#");
      const cleanLine = isBullet ? line.trim().replace(/^[-*]\s+/, "") : line;

      // Replace bold **text**
      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);

      const content = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={pIdx}
              className="bg-slate-200/60 dark:bg-slate-700/60 px-1 py-0.5 rounded text-[11px] font-mono text-indigo-600 dark:text-indigo-300"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs my-0.5">
            {content}
          </li>
        );
      }
      if (isHeader) {
        return (
          <p key={idx} className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 mt-2 mb-1">
            {content}
          </p>
        );
      }
      return (
        <p key={idx} className="text-xs leading-relaxed min-h-[1em] my-1">
          {content}
        </p>
      );
    });
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON (Always visible bottom-right) ── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce-subtle">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 p-3.5 sm:px-4 sm:py-3 text-white shadow-xl shadow-indigo-300 dark:shadow-indigo-950/70 border border-white/20 transition-all hover:scale-105 active:scale-95"
            title="Open AI Study Copilot"
          >
            <div className="relative flex items-center justify-center">
              <Sparkles size={20} className="text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
              </span>
            </div>
            <span className="hidden sm:inline text-xs font-bold tracking-tight pr-1">
              AI Study Copilot
            </span>
          </button>
        </div>
      )}

      {/* ── FLOATING CHAT DRAWER / WINDOW ── */}
      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex flex-col rounded-3xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.1] shadow-2xl transition-all duration-300 overflow-hidden ${
            isMinimized
              ? "w-80 h-14"
              : "w-[92vw] sm:w-[400px] h-[540px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.07] px-4 py-3 bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50 dark:from-[#1a202c] dark:via-[#161b22] dark:to-[#1a202c]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xs">
                <Sparkles size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    Study Copilot
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-full px-1.5 py-0.2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-[#64748b] truncate">
                  Context: {contextLabel}
                </p>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1">
              {!isMinimized && messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Clear chat history"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Close Copilot"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Drawer Body (Visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth text-slate-800 dark:text-[#e2e8f0]">
                {/* Welcome Card if empty */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center p-4 my-auto">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
                      <Bot size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                      Hi, {user?.name?.split(" ")[0] || "Student"}!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-[#94a3b8] max-w-xs mb-4 leading-relaxed">
                      I'm your Floating Study Copilot. Ask me to simplify tricky formulas, create mnemonics, or test your memory without leaving {contextLabel}.
                    </p>

                    {/* Quick suggestion chips */}
                    <div className="w-full space-y-1.5 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#64748b]">
                        Suggested Quick Questions:
                      </p>
                      {QUICK_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          className="w-full text-left text-xs bg-slate-50 hover:bg-indigo-50 dark:bg-[#1e2530] dark:hover:bg-indigo-500/15 text-slate-700 dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-indigo-400 p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.06] transition-all flex items-center justify-between group"
                        >
                          <span className="truncate">{prompt}</span>
                          <span className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors">
                            →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Bubbles */}
                {messages.map((m, index) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mt-0.5">
                          <Bot size={14} />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] rounded-2xl p-3 shadow-xs ${
                          isUser
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs"
                            : m.isError
                            ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-bl-xs"
                            : "bg-slate-100 dark:bg-[#1e2530] text-slate-800 dark:text-[#e2e8f0] rounded-bl-xs border border-slate-200/50 dark:border-white/[0.05]"
                        }`}
                      >
                        {isUser ? (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        ) : (
                          <div>{renderFormattedText(m.content)}</div>
                        )}
                      </div>

                      {isUser && (
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white mt-0.5">
                          <User size={13} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-[#64748b] pl-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 animate-spin">
                      <Sparkles size={12} />
                    </div>
                    <span>Copilot is formulating explanation...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick action chips when conversation is active */}
              {messages.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#1e2530]/30 flex-nowrap">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      disabled={isLoading}
                      onClick={() => handleSend(prompt)}
                      className="whitespace-nowrap flex-shrink-0 rounded-full bg-white dark:bg-[#1e2530] border border-slate-200/80 dark:border-white/[0.07] px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#161b22]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask a question or paste a formula..."
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#1e2530] px-3.5 py-2 text-xs text-slate-800 dark:text-[#e2e8f0] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs transition-all active:scale-95"
                    title="Send message"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
