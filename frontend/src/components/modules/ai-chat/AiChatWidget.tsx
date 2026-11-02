"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, RefreshCw, Send, Sparkles, Square, Trash2, X } from "lucide-react";

import { useStudentSession } from "@/hooks/useStudentSession";
import {
  ChatApiError,
  isAbortError,
  MAX_INPUT_LENGTH,
  streamChat,
  type ChatMessage,
} from "@/lib/ai-chat";
import MessageContent from "./MessageContent";

const STORAGE_KEY = "ecms-ai-chat";

const publicPrompts = [
  "What departments does the college have?",
  "How can I apply for admission?",
  "Where can I find the latest notices?",
  "How do I contact the college office?",
];
const studentPrompts = [
  "How do I view my results?",
  "How can I change my password?",
  "Where can I find the latest notices?",
  "How do I contact the college office?",
];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

function isStoredMessage(value: unknown): value is ChatMessage {
  const m = value as ChatMessage;
  return (
    !!m &&
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

export default function AiChatWidget() {
  const { student, ready } = useStudentSession();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previousStudentId = useRef<string | number | null>(null);

  // ── Restore the conversation after a page refresh (this tab only) ──
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setMessages(parsed.filter(isStoredMessage));
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || loading) return;
    try {
      const keep = messages.filter((m) => !m.error && m.content).slice(-30);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keep));
    } catch {
      /* storage can be full or blocked */
    }
  }, [messages, loading, hydrated]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // A student logging out must not leave their conversation behind for the next visitor
  const studentId = student?.id ?? null;
  useEffect(() => {
    if (!ready) return;
    if (previousStudentId.current !== null && previousStudentId.current !== studentId) clearChat();
    previousStudentId.current = studentId;
  }, [studentId, ready, clearChat]);

  // Stop any request still running when the widget unmounts
  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the newest message in view
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // ── Talking to the backend ──
  const requestReply = useCallback(async (history: ChatMessage[]) => {
    const assistantId = newId();
    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await streamChat({
        messages: history,
        signal: controller.signal,
        onText: (text) =>
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: text } : m))),
      });
      if (!reply.trim()) throw new ChatApiError("The assistant returned an empty reply. Please try again.", 200);
    } catch (err) {
      if (isAbortError(err)) {
        // Stopped by the user: keep what arrived, drop the bubble if nothing did
        setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.trim() !== ""));
      } else {
        const message = err instanceof ChatApiError ? err.message : "Something went wrong. Please try again.";
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: "", error: message } : m)));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, []);

  function send(text: string) {
    const content = text.trim().slice(0, MAX_INPUT_LENGTH);
    if (!content || loading) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    requestReply([...messages, { id: newId(), role: "user", content }]);
  }

  function retry() {
    if (loading) return;
    // Drop the failed reply and ask again with the same conversation
    requestReply(messages.filter((m) => !m.error));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value.slice(0, MAX_INPUT_LENGTH));
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  const firstName = student?.fullName?.split(" ")[0];
  const prompts = student ? studentPrompts : publicPrompts;
  const last = messages[messages.length - 1];
  const showTyping = loading && last?.role === "assistant" && last.content === "" && !last.error;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="ECMS assistant"
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-3 bottom-20 z-50 flex h-[min(600px,calc(100dvh-7rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">ECMS Assistant</p>
                  <p className="text-xs opacity-80">Ask about the college and your portal</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    aria-label="Clear conversation"
                    title="Clear conversation"
                    className="rounded-lg p-2 transition hover:bg-white/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close assistant"
                  className="rounded-lg p-2 transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
                      Hi{firstName ? ` ${firstName}` : ""}! I&apos;m the ECMS assistant. I can answer questions about
                      departments, admissions, notices and how to use this portal. What would you like to know?
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-11">
                    {prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => send(prompt)}
                        className="rounded-full border px-3 py-1.5 text-left text-xs transition hover:border-primary hover:text-primary"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                        {m.content}
                      </div>
                    </div>
                  );
                }

                if (m.error) {
                  return (
                    <div key={m.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
                        <Bot className="h-4 w-4" />
                      </span>
                      <div role="alert" className="rounded-2xl rounded-tl-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                        <p>{m.error}</p>
                        <button
                          onClick={retry}
                          disabled={loading}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-2 disabled:opacity-50"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Try again
                        </button>
                      </div>
                    </div>
                  );
                }

                // Empty assistant bubble = waiting for the first words (typing dots shown below)
                if (m.content === "") return null;

                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-sm">
                      <MessageContent content={m.content} />
                    </div>
                  </div>
                );
              })}

              {showTyping && (
                <div className="flex items-start gap-3" aria-label="Assistant is typing">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-muted px-4 py-3.5">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Type your question..."
                  aria-label="Message"
                  className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                {loading ? (
                  <button
                    onClick={() => abortRef.current?.abort()}
                    aria-label="Stop generating"
                    title="Stop"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition hover:bg-muted"
                  >
                    <Square className="h-4 w-4 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                <span>AI can make mistakes. Confirm important details with the college office.</span>
                {input.length > MAX_INPUT_LENGTH * 0.8 && (
                  <span className="shrink-0">
                    {input.length}/{MAX_INPUT_LENGTH}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 hover:opacity-95 sm:bottom-5 sm:right-5"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}