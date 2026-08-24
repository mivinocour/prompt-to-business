"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowLeft,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { getAgentIcon } from "@/components/agent-icon";
import { SettingsToggle } from "@/components/ui/settings-toggle";
import {
  AVAILABLE_TOOLS,
  AVAILABLE_MCP_CONNECTIONS,
  DEFAULT_TRIGGERS,
} from "@/lib/agent-config";
import type {
  Agent,
  AgentTool,
  MCPConnection,
  AgentTrigger,
} from "@/types/agent";

// ── Status Badge ──

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  draft: {
    bg: "rgba(255,255,255,0.06)",
    text: "var(--color-v3-text-var)",
    dot: "var(--color-v3-text-var)",
  },
  ready: {
    bg: "rgba(52,211,153,0.10)",
    text: "#34d399",
    dot: "#34d399",
  },
  testing: {
    bg: "rgba(251,191,36,0.10)",
    text: "#fbbf24",
    dot: "#fbbf24",
  },
  deployed: {
    bg: "rgba(96,165,250,0.10)",
    text: "#60a5fa",
    dot: "#60a5fa",
  },
};

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontFamily: "var(--font-inter), sans-serif",
        fontWeight: 500,
        lineHeight: "16px",
        background: colors.bg,
        color: colors.text,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: colors.dot,
          flexShrink: 0,
        }}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── Props ──

interface AgentEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent;
  onAgentChange: (agent: Agent) => void;
}

// ── Component ──

export function AgentEditDrawer({
  open,
  onOpenChange,
  agent,
  onAgentChange,
}: AgentEditDrawerProps) {
  // Local editing state seeded from agent prop
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [systemInstruction, setSystemInstruction] = useState(
    agent.systemInstruction
  );
  const [tools, setTools] = useState<AgentTool[]>(() => {
    // Merge agent tools with full catalog so every available tool is shown
    return AVAILABLE_TOOLS.map((catalogTool) => {
      const agentTool = agent.tools.find((t) => t.id === catalogTool.id);
      return agentTool ? { ...catalogTool, enabled: agentTool.enabled } : { ...catalogTool };
    });
  });
  const [mcpConnections, setMcpConnections] = useState<MCPConnection[]>(() => {
    return AVAILABLE_MCP_CONNECTIONS.map((catalogConn) => {
      const agentConn = agent.mcpConnections.find((c) => c.id === catalogConn.id);
      return agentConn
        ? { ...catalogConn, status: agentConn.status }
        : { ...catalogConn };
    });
  });
  const [triggers, setTriggers] = useState<AgentTrigger[]>(() => {
    return DEFAULT_TRIGGERS.map((catalogTrigger) => {
      const agentTrigger = agent.triggers.find((t) => t.id === catalogTrigger.id);
      return agentTrigger
        ? { ...catalogTrigger, enabled: agentTrigger.enabled }
        : { ...catalogTrigger };
    });
  });

  // Collapsible section states
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [mcpExpanded, setMcpExpanded] = useState(false);
  const [triggersExpanded, setTriggersExpanded] = useState(false);

  // ── Handlers ──

  const handleToolToggle = (toolId: string, enabled: boolean) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, enabled } : t))
    );
  };

  const handleMcpToggle = (connId: string) => {
    setMcpConnections((prev) =>
      prev.map((c) =>
        c.id === connId
          ? {
              ...c,
              status: c.status === "connected" ? "disconnected" : "connected",
            }
          : c
      )
    );
  };

  const handleTriggerToggle = (triggerId: string, enabled: boolean) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === triggerId ? { ...t, enabled } : t))
    );
  };

  const handleSave = () => {
    onAgentChange({
      ...agent,
      name,
      description,
      systemInstruction,
      tools: tools.filter((t) => t.enabled),
      mcpConnections: mcpConnections.filter((c) => c.status === "connected"),
      triggers: triggers.filter((t) => t.enabled),
      updatedAt: new Date(),
    });
    onOpenChange(false);
  };

  // Find the model display name from the agent's modelId
  const modelDisplayName = agent.modelId
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showClose={false}
        side="right"
        className="w-full max-w-[505px] lg:w-[505px] h-screen bg-background/95 border-l border-border backdrop-blur p-0 flex flex-col"
        style={{
          maxWidth: "min(505px, 100vw)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <SheetTitle className="sr-only">Edit Agent</SheetTitle>
        <SheetDescription className="sr-only">
          Edit this agent&apos;s identity, tools, connections, and triggers.
        </SheetDescription>

        {/* ── Header ── */}
        <div
          className="w-full h-12 px-4 pt-4 flex justify-between items-center bg-background/95 backdrop-blur-md border-border flex-shrink-0"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Close agent editor"
              onClick={() => onOpenChange(false)}
              className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="text-foreground text-sm font-medium font-tight leading-tight"
              style={{ fontFamily: "var(--font-inter-tight), system-ui, sans-serif" }}
            >
              Edit Agent
            </div>
          </div>
          <button
            type="button"
            aria-label="Close agent editor"
            onClick={() => onOpenChange(false)}
            className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-auto-hide px-4 pb-4">
          {/* ===== Section 1: Agent Identity ===== */}
          <div style={{ marginTop: 16 }}>
            <p className="settings-group-title" style={{ marginBottom: 10 }}>
              Agent Identity
            </p>

            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <label
                className="settings-item-label"
                style={{ display: "block", marginBottom: 4, fontSize: 12 }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  height: 36,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "1px solid var(--color-v3-outline-var)",
                  background: "transparent",
                  color: "var(--color-v3-text)",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  outline: "none",
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 12 }}>
              <label
                className="settings-item-label"
                style={{ display: "block", marginBottom: 4, fontSize: 12 }}
              >
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--color-v3-outline-var)",
                  background: "transparent",
                  color: "var(--color-v3-text)",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  resize: "vertical",
                  outline: "none",
                  lineHeight: "1.5",
                }}
              />
            </div>

            {/* Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                className="settings-item-label"
                style={{ fontSize: 12 }}
              >
                Status
              </span>
              <StatusBadge status={agent.status} />
            </div>
          </div>

          <hr className="settings-divider" />

          {/* ===== Section 2: Base Model ===== */}
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <p
              className="settings-group-title"
              style={{ marginBottom: 10 }}
            >
              Base Model
            </p>
            <div className="settings-card" style={{ cursor: "default" }}>
              <span className="card-title">{modelDisplayName}</span>
              <span className="card-subtitle" style={{ display: "block" }}>
                {agent.modelId}
              </span>
            </div>
          </div>

          <hr className="settings-divider" />

          {/* ===== Section 3: System Instructions ===== */}
          <div style={{ marginTop: 8, marginBottom: 8 }}>
            <p
              className="settings-group-title"
              style={{ marginBottom: 10 }}
            >
              System Instructions
            </p>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              style={{
                width: "100%",
                minHeight: 120,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--color-v3-outline-var)",
                background: "transparent",
                color: "var(--color-v3-text)",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 14,
                fontWeight: 400,
                resize: "vertical",
                outline: "none",
                lineHeight: "1.5",
              }}
            />
          </div>

          <hr className="settings-divider" />

          {/* ===== Section 4: Tools (collapsible) ===== */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              marginTop: 8,
              marginBottom: 8,
            }}
            onClick={() => setToolsExpanded(!toolsExpanded)}
          >
            <p className="settings-group-title">Tools</p>
            <button
              className={`settings-expand-btn ${toolsExpanded ? "expanded" : "collapsed"}`}
              aria-label="Expand or collapse tools"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {toolsExpanded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {tools.map((tool) => {
                const Icon = getAgentIcon(tool.icon);
                return (
                  <div
                    key={tool.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: "var(--color-v3-surface-container-high)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--color-v3-text-var)" }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            color: "var(--color-v3-text)",
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: "20px",
                          }}
                        >
                          {tool.name}
                        </div>
                        <div
                          style={{
                            color: "var(--color-v3-text-var)",
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 12,
                            fontWeight: 400,
                            lineHeight: "16px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tool.description}
                        </div>
                      </div>
                    </div>
                    <SettingsToggle
                      label={tool.name}
                      checked={tool.enabled}
                      onChange={(val) => handleToolToggle(tool.id, val)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <hr className="settings-divider" />

          {/* ===== Section 5: MCP Connections (collapsible) ===== */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              marginTop: 8,
              marginBottom: 8,
            }}
            onClick={() => setMcpExpanded(!mcpExpanded)}
          >
            <p className="settings-group-title">MCP Connections</p>
            <button
              className={`settings-expand-btn ${mcpExpanded ? "expanded" : "collapsed"}`}
              aria-label="Expand or collapse MCP connections"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {mcpExpanded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {mcpConnections.map((conn) => {
                const Icon = getAgentIcon(conn.icon);
                const isConnected = conn.status === "connected";
                return (
                  <div
                    key={conn.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: "var(--color-v3-surface-container-high)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--color-v3-text-var)" }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--color-v3-text)",
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: "20px",
                          }}
                        >
                          {conn.name}
                        </span>
                        {/* Status dot */}
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: isConnected ? "#34d399" : "#6b7280",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleMcpToggle(conn.id)}
                      style={{
                        height: 28,
                        padding: "0 10px",
                        borderRadius: 8,
                        border: "1px solid var(--color-v3-outline-var)",
                        background: isConnected
                          ? "transparent"
                          : "var(--color-v3-button-container)",
                        color: "var(--color-v3-text)",
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <hr className="settings-divider" />

          {/* ===== Section 6: Triggers (collapsible) ===== */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              marginTop: 8,
              marginBottom: 8,
            }}
            onClick={() => setTriggersExpanded(!triggersExpanded)}
          >
            <p className="settings-group-title">Triggers</p>
            <button
              className={`settings-expand-btn ${triggersExpanded ? "expanded" : "collapsed"}`}
              aria-label="Expand or collapse triggers"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {triggersExpanded && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {triggers.map((trigger) => {
                const Icon = getAgentIcon(trigger.icon);
                return (
                  <div
                    key={trigger.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: "var(--color-v3-surface-container-high)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--color-v3-text-var)" }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            color: "var(--color-v3-text)",
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: "20px",
                          }}
                        >
                          {trigger.name}
                        </div>
                        <div
                          style={{
                            color: "var(--color-v3-text-var)",
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 12,
                            fontWeight: 400,
                            lineHeight: "16px",
                          }}
                        >
                          {trigger.description}
                        </div>
                      </div>
                    </div>
                    <SettingsToggle
                      label={trigger.name}
                      checked={trigger.enabled}
                      onChange={(val) =>
                        handleTriggerToggle(trigger.id, val)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sticky Save Footer ── */}
        <div
          className="flex-shrink-0"
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--color-v3-outline-var)",
            background: "var(--color-v3-surface-container)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              height: 36,
              borderRadius: 12,
              border: "1px solid var(--color-v3-outline-var)",
              background: "var(--color-v3-button-container)",
              color: "var(--color-v3-text)",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = "0.85")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.opacity = "1")
            }
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
