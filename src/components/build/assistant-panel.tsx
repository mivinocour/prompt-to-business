"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MsIcon } from "./icon";

interface ActionFile {
  name: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  bullets?: { title: string; body: string }[];
  actions?: { editedFiles: ActionFile[]; built: boolean };
  meta?: string;
  thinking?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "assistant",
    meta: "Gemini 3.5 Flash  •  Ran for 52s",
    actions: {
      editedFiles: [{ name: "metadata.json" }, { name: "src/App.tsx" }],
      built: true,
    },
    text: "I have completed the Todo List application. It is a single-screen, highly polished tool for managing daily tasks:",
    bullets: [
      {
        title: "Minimalist Aesthetic",
        body: "Features a clean, centered interface with generous negative space, high-contrast typography, and subtle transitions.",
      },
      {
        title: "Persistent Local Storage",
        body: "Tasks are automatically saved to your browser, so your list remains available between sessions.",
      },
      {
        title: "Interactive Controls",
        body: "Includes smooth task entry, toggle completion, and quick deletion, enhanced with fluid animation effects for a responsive user experience.",
      },
    ],
  },
];

function GeminiSpark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C12 7.52 7.52 12 2 12c5.52 0 10 4.48 10 10 0-5.52 4.48-10 10-10-5.52 0-10-4.48-10-10Z"
        fill="url(#spark)"
      />
      <defs>
        <linearGradient id="spark" x1="2" y1="22" x2="22" y2="2">
          <stop stopColor="#1A73E8" />
          <stop offset="1" stopColor="#4285F4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ActionHistoryCard({ actions }: { actions: NonNullable<Message["actions"]> }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-5 rounded-xl border border-[#333333]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center gap-2 px-3 text-[14px] text-[#9a9a9a]"
      >
        {/* real glyph is "summarize_auto" (Google-internal); "summarize" is the closest public one */}
        <MsIcon name="summarize" size={16} />
        Action history
        <span className={`ml-auto transition-transform ${open ? "rotate-90" : ""}`}>
          <MsIcon name="chevron_right" size={18} />
        </span>
      </button>
      {open && (
        <div className="border-t border-[#333333] px-4 py-4">
          <p className="mb-4 text-[14px] text-[#9a9a9a]">
            Here are key actions taken for the app:
          </p>
          <div className="mb-2 flex items-center gap-3 text-[14px] text-[#c4c4c4]">
            <MsIcon name="edit" size={16} className="text-[#9a9a9a]" />
            Edited {actions.editedFiles.length} files
          </div>
          <div className="mb-2 flex flex-col gap-1">
            {actions.editedFiles.map((f) => (
              <div
                key={f.name}
                className="flex items-center justify-between py-1 pl-7 text-[14px] text-[#c4c4c4]"
              >
                {f.name}
                <MsIcon name="check_circle" size={18} className="text-[#34a853]" />
              </div>
            ))}
          </div>
          {actions.built && (
            <div className="flex items-center gap-3 pt-1 text-[14px] text-[#c4c4c4]">
              <MsIcon name="build" size={16} className="text-[#9a9a9a]" />
              Built
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckpointBar({ onViewChanges }: { onViewChanges?: () => void }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center gap-2 text-[14px] text-[#9a9a9a]">
        <MsIcon name="flag" size={16} />
        Checkpoint
      </div>
      <div className="flex items-center gap-1">
        <button
          aria-label="Thumbs up"
          aria-pressed={feedback === "up"}
          onClick={() => setFeedback((value) => (value === "up" ? null : "up"))}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc] ${
            feedback === "up" ? "bg-[#304a3a] text-[#81c995]" : "text-[#d4d4d4]"
          }`}
        >
          <MsIcon name="thumb_up" size={16} />
        </button>
        <button
          aria-label="Thumbs down"
          aria-pressed={feedback === "down"}
          onClick={() => setFeedback((value) => (value === "down" ? null : "down"))}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc] ${
            feedback === "down" ? "bg-[#573536] text-[#f28b82]" : "text-[#d4d4d4]"
          }`}
        >
          <MsIcon name="thumb_down" size={16} />
        </button>
        <button
          aria-label="View differences"
          onClick={onViewChanges}
          className="mx-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] font-medium text-[#e3e3e3] transition-colors hover:bg-[#323232]"
        >
          View changes
        </button>
        <button
          disabled
          aria-label="Restore code from this checkpoint"
          className="flex h-8 cursor-default items-center gap-1.5 rounded-xl border border-[#333333] px-3 text-[12px] font-medium text-[#6b6b6b]"
        >
          <MsIcon name="redo" size={16} />
          Restore
        </button>
      </div>
    </div>
  );
}

export function AssistantPanel({ onViewChanges }: { onViewChanges?: () => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(100);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userId = ++idRef.current;
    const thinkingId = ++idRef.current;
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", text },
      { id: thinkingId, role: "assistant", text: "Thinking...", thinking: true },
    ]);
    setTimeout(() => {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === thinkingId
            ? {
                id: thinkingId,
                role: "assistant" as const,
                meta: "Gemini 3.5 Flash  •  Ran for 4s",
                text: "This is a prototype of Build mode — the assistant isn't wired up to a model yet, so I can't make that change. Soon!",
              }
            : msg
        )
      );
    }, 1800);
  };

  return (
    <div className="flex h-full w-[535px] shrink-0 flex-col border-r border-[#333333]">
      {/* Panel header */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <GeminiSpark />
          <span className="text-[14px] text-[#9a9a9a]">Gemini</span>
        </div>
        <button
          aria-label="New chat"
          onClick={() => {
            setMessages([]);
            setInput("");
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
        >
          <MsIcon name="add" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {msg.role === "user" ? (
                <div className="my-4 flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-[#2a2a2a] px-4 py-2.5 text-[14px] leading-[1.55] text-[#e3e3e3]">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  {msg.meta && (
                    <div className="mb-4 whitespace-pre text-[14px] text-[#9a9a9a]">
                      {msg.meta}
                    </div>
                  )}
                  {msg.actions && <ActionHistoryCard actions={msg.actions} />}
                  <p
                    className={`text-[14px] leading-[1.6] ${
                      msg.thinking ? "animate-pulse text-[#9a9a9a]" : "text-[#d4d4d4]"
                    }`}
                  >
                    {msg.text}
                  </p>
                  {msg.bullets && (
                    <ul className="mt-4 flex flex-col gap-3 pl-6">
                      {msg.bullets.map((b) => (
                        <li
                          key={b.title}
                          className="list-disc text-[14px] leading-[1.6] text-[#d4d4d4]"
                        >
                          <span className="font-semibold">{b.title}</span>: {b.body}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!msg.thinking && msg.actions && (
                    <CheckpointBar onViewChanges={onViewChanges} />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="shrink-0 px-2 pb-2">
        <div className="mb-2 px-2 text-[#e8710a]">
          {/* real glyph is "lightbulb_tips" (Google-internal); "lightbulb" is the closest public one */}
          <MsIcon name="lightbulb" size={16} />
        </div>
        <div className="rounded-xl border border-[#333333] bg-[#252525] p-3 transition-colors focus-within:border-[#4d4d4d]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Make changes, add new features, ask for anything"
            rows={2}
            className="w-full resize-none bg-transparent text-[14px] leading-[1.5] text-[#d4d4d4] placeholder-[#8f8f8f] outline-none"
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              aria-label="Speech to text"
              disabled
              title="Speech input is coming soon"
              className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-xl border border-[#333333] text-[#666]"
            >
              <MsIcon name="mic" size={16} />
            </button>
            <button
              aria-label="Insert files (text, images, and more)"
              disabled
              title="File attachments are coming soon"
              className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-xl border border-[#333333] text-[#666]"
            >
              <MsIcon name="add_circle" size={16} />
            </button>
            <button
              aria-label="Send"
              onClick={send}
              disabled={!input.trim()}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                input.trim()
                  ? "border-transparent bg-[#e3e3e3] text-[#191919] hover:bg-white"
                  : "border-[#333333] bg-[#1f1f1f] text-[#575757]"
              }`}
            >
              <MsIcon name="arrow_upward_alt" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
