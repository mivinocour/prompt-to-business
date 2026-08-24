"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MsIcon } from "./icon";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type PreviewDevice = "desktop" | "mobile";

const TODO_STORAGE_KEY = "ais-build-preview-todos-v2";
const LEGACY_TODO_STORAGE_KEY = "ais-build-preview-todos";

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_TODO_STORAGE_KEY);
      const savedTodos = window.localStorage.getItem(TODO_STORAGE_KEY);
      if (savedTodos) setTodos(JSON.parse(savedTodos) as Todo[]);
    } catch {
      window.localStorage.removeItem(TODO_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  }, [hydrated, todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos((t) => [...t, { id: Date.now(), text: input.trim(), completed: false }]);
    setInput("");
  };

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-[#f7f7f8]"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <div className="w-full max-w-[448px] rounded-2xl bg-white p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <h1 className="mb-6 text-[28px] font-semibold tracking-tight text-[#111318]">
          Todo List
        </h1>
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="h-12 flex-1 rounded-lg border border-[#e2e3e7] bg-white px-4 text-[15px] text-[#111318] placeholder-[#9aa0a6] outline-none transition-colors focus:border-[#111318]"
          />
          <button
            onClick={addTodo}
            aria-label="Add task"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#111827] text-2xl font-light text-white transition-transform active:scale-95"
          >
            +
          </button>
        </div>
        {todos.length === 0 ? (
          <p className="mt-8 text-center text-[15px] text-[#9aa0a6]">
            No tasks yet. Add one above!
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {todos.map((todo) => (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  className="group flex items-center justify-between rounded-lg border border-[#eef0f3] px-4 py-3"
                >
                  <button
                    onClick={() =>
                      setTodos((t) =>
                        t.map((x) => (x.id === todo.id ? { ...x, completed: !x.completed } : x))
                      )
                    }
                    className={`text-left text-[15px] ${
                      todo.completed ? "text-[#9aa0a6] line-through" : "text-[#111318]"
                    }`}
                  >
                    {todo.text}
                  </button>
                  <button
                    onClick={() => setTodos((t) => t.filter((x) => x.id !== todo.id))}
                    className="text-lg text-[#c3c7cd] opacity-0 transition-opacity hover:text-[#111318] group-hover:opacity-100"
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

export function PreviewPanel({
  device,
  resetKey,
}: {
  device: PreviewDevice;
  resetKey: number;
}) {
  const [consoleOpen, setConsoleOpen] = useState(false);

  return (
    <div className="relative flex h-full flex-1 flex-col">
      {/* Preview canvas */}
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-[#111111] p-3">
        <div
          className={`h-full overflow-hidden bg-white transition-[width,border-radius] duration-200 ${
            device === "mobile"
              ? "w-[390px] max-w-full rounded-[24px] border-[6px] border-[#2d2d2d]"
              : "w-full"
          }`}
        >
          <TodoApp key={resetKey} />
        </div>
      </div>

      {/* Debug panel */}
      <AnimatePresence>
        {consoleOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-[#333333] bg-[#1f1f1f]"
          >
            <div className="flex h-[200px] flex-col px-4 py-3">
              <span className="mb-2 text-[13px] font-medium text-[#d4d4d4]">Console</span>
              <div className="flex flex-col gap-1 overflow-y-auto text-[12px] text-[#9a9a9a]" style={{ fontFamily: "'Space Mono', Menlo, monospace" }}>
                <span>[vite] connecting...</span>
                <span>[vite] connected.</span>
                <span className="text-[#8ab4f8]">Download the React DevTools for a better development experience</span>
                <span>[vite] hot updated: /src/App.tsx</span>
                <span>[vite] hot updated: /src/index.css</span>
                <span>Todos loaded from localStorage (0 items)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        aria-label={consoleOpen ? "Close app debug panel" : "Open app debug panel"}
        onClick={() => setConsoleOpen((o) => !o)}
        className="absolute bottom-2 right-3 flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] text-[#a8abb4] transition-colors hover:bg-black/20"
      >
        <MsIcon name="info" size={16} />
        6
        <MsIcon name={consoleOpen ? "keyboard_arrow_down" : "keyboard_arrow_up"} size={16} />
      </button>
    </div>
  );
}

export function PreviewToolbarControls({
  device,
  onDeviceChange,
  onFullscreen,
  onRefresh,
}: {
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onFullscreen?: () => void;
  onRefresh?: () => void;
}) {
  const [spinning, setSpinning] = useState(false);
  return (
    <div className="flex h-9 w-[280px] items-center rounded-xl bg-[#2a2a2a] px-2">
      <button
        aria-label={`Switch to ${device === "desktop" ? "mobile" : "desktop"} preview`}
        aria-pressed={device === "mobile"}
        onClick={() => onDeviceChange(device === "desktop" ? "mobile" : "desktop")}
        className={`flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#3a3a3a] ${
          device === "mobile" ? "bg-[#3a3a3a] text-white" : "text-[#d4d4d4]"
        }`}
      >
        <MsIcon name="devices" size={16} />
      </button>
      <span className="mx-2 flex-1 truncate text-[13px] text-[#d4d4d4]">/</span>
      <button
        aria-label="Refresh preview"
        onClick={() => {
          setSpinning(true);
          onRefresh?.();
          setTimeout(() => setSpinning(false), 500);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#d4d4d4] hover:bg-[#3a3a3a]"
      >
        <span className={spinning ? "animate-spin" : ""}>
          <MsIcon name="sync" size={16} />
        </span>
      </button>
      <button
        aria-label="Fullscreen"
        onClick={onFullscreen}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[#d4d4d4] hover:bg-[#3a3a3a]"
      >
        <MsIcon name="fullscreen" size={16} />
      </button>
    </div>
  );
}

export function EditModeButton() {
  const [active, setActive] = useState(false);
  return (
    <button
      aria-label="Edit tool"
      onClick={() => setActive((a) => !a)}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        active ? "bg-[#8ab4f8] text-[#191919]" : "text-[#d4d4d4] hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
      }`}
    >
      <MsIcon name="draw" size={18} />
    </button>
  );
}
