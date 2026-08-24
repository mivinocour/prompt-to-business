import {
  AVAILABLE_MCP_CONNECTIONS,
  AVAILABLE_TOOLS,
  DEFAULT_TRIGGERS,
} from "@/lib/agent-config";
import { Agent } from "@/types/agent";
import { ConfigSuggestion, ConfigSuggestionType } from "@/types/chat";

const CONFIG_KEYWORDS = [
  "add tool",
  "remove tool",
  "add mcp",
  "add connection",
  "remove connection",
  "change trigger",
  "add trigger",
  "remove trigger",
  "enable",
  "disable",
  "add web search",
  "add email",
  "add slack",
  "add calendar",
  "add code",
  "add api",
  "add file",
  "add database",
  "add github",
  "add google drive",
  "remove web search",
  "remove email",
  "remove slack",
  "remove calendar",
  "change model",
  "switch model",
  "add scraping",
  "add web scraping",
  "connect gmail",
  "connect slack",
  "connect github",
  "disconnect",
  "run hourly",
  "run daily",
  "schedule",
  "add webhook",
] as const;

const SUGGESTION_TYPES = new Set<ConfigSuggestionType>([
  "add_tool",
  "remove_tool",
  "add_mcp",
  "remove_mcp",
  "add_trigger",
  "remove_trigger",
]);

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

export function isAgentConfigRequest(prompt: string): boolean {
  const normalizedPrompt = prompt.toLowerCase().trim();
  return CONFIG_KEYWORDS.some((keyword) => normalizedPrompt.includes(keyword));
}

export function normalizeConfigSuggestions(value: unknown): ConfigSuggestion[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const record = asRecord(item);
    const type = record?.type;

    if (!record || typeof type !== "string" || !SUGGESTION_TYPES.has(type as ConfigSuggestionType)) {
      return [];
    }

    return [{
      type: type as ConfigSuggestionType,
      label: asString(record.label, "Change"),
      details: asString(record.details),
      itemId: asString(record.itemId),
      status: "pending" as const,
    }];
  });
}

export function applyConfigSuggestion(agent: Agent, suggestion: ConfigSuggestion): Agent {
  const updatedAgent: Agent = { ...agent };

  switch (suggestion.type) {
    case "add_tool": {
      const tool = AVAILABLE_TOOLS.find((candidate) => candidate.id === suggestion.itemId);
      if (tool && !agent.tools.some((candidate) => candidate.id === tool.id)) {
        updatedAgent.tools = [...agent.tools, { ...tool, enabled: true }];
      }
      break;
    }
    case "remove_tool":
      updatedAgent.tools = agent.tools.filter((tool) => tool.id !== suggestion.itemId);
      break;
    case "add_mcp": {
      const connection = AVAILABLE_MCP_CONNECTIONS.find(
        (candidate) => candidate.id === suggestion.itemId
      );
      if (connection && !agent.mcpConnections.some((candidate) => candidate.id === connection.id)) {
        updatedAgent.mcpConnections = [
          ...agent.mcpConnections,
          { ...connection, status: "connected" },
        ];
      }
      break;
    }
    case "remove_mcp":
      updatedAgent.mcpConnections = agent.mcpConnections.filter(
        (connection) => connection.id !== suggestion.itemId
      );
      break;
    case "add_trigger": {
      const trigger = DEFAULT_TRIGGERS.find((candidate) => candidate.id === suggestion.itemId);
      if (trigger && !agent.triggers.some((candidate) => candidate.id === trigger.id)) {
        updatedAgent.triggers = [...agent.triggers, { ...trigger, enabled: true }];
      }
      break;
    }
    case "remove_trigger":
      updatedAgent.triggers = agent.triggers.filter(
        (trigger) => trigger.id !== suggestion.itemId
      );
      break;
  }

  return updatedAgent;
}
