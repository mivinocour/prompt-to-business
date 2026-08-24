"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Wrench,
  Lightbulb,
  Check,
  X,
  Loader2,
  ArrowRight,
  ChevronDown,
  Pencil,
  Search,
  Terminal,
  Globe,
  FileText,
  Database,
  Mail,
  Calendar,
  MessageSquare,
} from "lucide-react";
import type { AgentMessageBlock } from "@/types/agent";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AgentMessageBlocksProps {
  blocks: AgentMessageBlock[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick an icon for a tool call based on metadata or title keywords. */
function toolIcon(block: AgentMessageBlock) {
  const name = (
    (block.metadata?.toolType as string) ??
    block.title ??
    ""
  ).toLowerCase();

  if (name.includes("web") || name.includes("browse")) return Globe;
  if (name.includes("search")) return Search;
  if (name.includes("code") || name.includes("exec") || name.includes("terminal"))
    return Terminal;
  if (name.includes("file") || name.includes("read")) return FileText;
  if (name.includes("database") || name.includes("query")) return Database;
  if (name.includes("email") || name.includes("mail")) return Mail;
  if (name.includes("calendar")) return Calendar;
  if (name.includes("slack") || name.includes("message")) return MessageSquare;
  return Wrench;
}

/** Format a duration in seconds into a human-readable string. */
function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusIndicator({ status }: { status: AgentMessageBlock["status"] }) {
  return (
    <AnimatePresence mode="wait">
      {status === "running" && (
        <motion.div
          key="running"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Loader2
            className="w-3 h-3 animate-spin"
            style={{ color: "var(--color-v3-text-var)" }}
          />
        </motion.div>
      )}
      {status === "completed" && (
        <motion.div
          key="completed"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Check className="w-3 h-3" style={{ color: "#22c55e" }} />
        </motion.div>
      )}
      {status === "failed" && (
        <motion.div
          key="failed"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <X className="w-3 h-3" style={{ color: "#ef4444" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShimmerText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="animate-shimmer"
      style={{
        background:
          "linear-gradient(to right, var(--color-v3-text-var) 0%, var(--color-v3-text) 10%, var(--color-v3-text-var) 20%)",
        backgroundPosition: "0",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        backgroundSize: "200px 100%",
      }}
    >
      {children}
    </span>
  );
}

function CollapsibleContent({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Block renderers
// ---------------------------------------------------------------------------

function ThinkingBlock({ block }: { block: AgentMessageBlock }) {
  const [collapsed, setCollapsed] = useState(block.defaultCollapsed);

  const title =
    block.status === "running"
      ? "Thinking..."
      : block.duration
        ? `Thought for ${formatDuration(block.duration)}`
        : block.title;

  return (
    <div
      style={{
        background: "var(--color-v3-surface-container-high)",
        border: "1px solid var(--color-v3-outline-var)",
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => block.collapsible && setCollapsed((c) => !c)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 12px",
          cursor: block.collapsible ? "pointer" : "default",
          background: "none",
          border: "none",
          textAlign: "left",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        <Brain
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "var(--color-v3-text-var)" }}
        />

        <span
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-v3-text-var)",
          }}
        >
          {block.status === "running" ? (
            <ShimmerText>{title}</ShimmerText>
          ) : (
            title
          )}
        </span>

        {block.collapsible && (
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              className="w-3 h-3"
              style={{ color: "var(--color-v3-text-var)" }}
            />
          </motion.div>
        )}
      </button>

      {/* Content */}
      <CollapsibleContent isOpen={!collapsed}>
        <div
          style={{
            padding: "0 12px 10px 36px",
            fontSize: 12,
            lineHeight: "1.6",
            color: "var(--color-v3-text-var)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {block.content}
        </div>
      </CollapsibleContent>
    </div>
  );
}

function ToolCallBlock({ block }: { block: AgentMessageBlock }) {
  const [collapsed, setCollapsed] = useState(block.defaultCollapsed);
  const Icon = toolIcon(block);

  return (
    <div
      style={{
        background: "var(--color-v3-surface-container)",
        border: "1px solid var(--color-v3-outline-var)",
        borderRadius: 12,
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => block.collapsible && setCollapsed((c) => !c)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 12px",
          cursor: block.collapsible ? "pointer" : "default",
          background: "none",
          border: "none",
          textAlign: "left",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        <Icon
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "var(--color-v3-text-var)" }}
        />

        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-v3-text)",
          }}
        >
          {block.title}
        </span>

        <StatusIndicator status={block.status} />

        {block.collapsible && (
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              className="w-3 h-3"
              style={{ color: "var(--color-v3-text-var)" }}
            />
          </motion.div>
        )}
      </button>

      {/* Content */}
      <CollapsibleContent isOpen={!collapsed}>
        <div
          style={{
            padding: "0 12px 10px 36px",
            fontSize: 12,
            lineHeight: "1.6",
            color: "var(--color-v3-text-var)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {block.content}
        </div>
      </CollapsibleContent>
    </div>
  );
}

function ToolResultBlock({ block }: { block: AgentMessageBlock }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        paddingLeft: 24,
      }}
    >
      <ArrowRight
        className="w-3 h-3 flex-shrink-0"
        style={{
          color: "var(--color-v3-outline-var)",
          marginTop: 2,
        }}
      />
      <span
        style={{
          fontSize: 12,
          lineHeight: "1.6",
          color: "var(--color-v3-text-var)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {block.content}
      </span>
    </div>
  );
}

function ReasoningStepBlock({
  block,
  stepNumber,
}: {
  block: AgentMessageBlock;
  stepNumber: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <Lightbulb
        className="w-4 h-4 flex-shrink-0"
        style={{ color: "var(--color-v3-text-var)", marginTop: 1 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-v3-text-var)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            marginBottom: 2,
          }}
        >
          Step {stepNumber}
        </div>
        <div
          style={{
            fontSize: 12,
            lineHeight: "1.6",
            color: "var(--color-v3-text-var)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {block.content}
        </div>
      </div>
    </div>
  );
}

function StatusUpdateBlock({ block }: { block: AgentMessageBlock }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Pencil
        className="w-4 h-4 flex-shrink-0"
        style={{ color: "var(--color-v3-text-var)" }}
      />
      <span
        style={{
          fontSize: 12,
          color: "var(--color-v3-text-var)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        }}
      >
        {block.status === "running" ? (
          <ShimmerText>{block.title}</ShimmerText>
        ) : (
          block.title
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Timeline connector
// ---------------------------------------------------------------------------

function TimelineConnector() {
  return (
    <motion.div
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        width: 2,
        height: 12,
        marginLeft: 19,
        background: "var(--color-v3-outline-var)",
        borderRadius: 1,
        transformOrigin: "top",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AgentMessageBlocks({ blocks }: AgentMessageBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  // Track reasoning step numbering
  let reasoningStepCount = 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {blocks.map((block, index) => {
        // Increment reasoning step counter
        if (block.type === "reasoning_step") {
          reasoningStepCount += 1;
        }

        // Tool results render inline without a connector above them
        // when they follow a tool call
        const previousBlock = index > 0 ? blocks[index - 1] : null;
        const isToolResultAfterCall =
          block.type === "tool_result" &&
          previousBlock?.type === "tool_call";

        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Timeline connector between blocks (skip before first block
                and skip between a tool_call and its tool_result) */}
            {index > 0 && !isToolResultAfterCall && <TimelineConnector />}

            {/* Render block */}
            {block.type === "thinking" && <ThinkingBlock block={block} />}
            {block.type === "tool_call" && <ToolCallBlock block={block} />}
            {block.type === "tool_result" && <ToolResultBlock block={block} />}
            {block.type === "reasoning_step" && (
              <ReasoningStepBlock
                block={block}
                stepNumber={reasoningStepCount}
              />
            )}
            {block.type === "status_update" && (
              <StatusUpdateBlock block={block} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
