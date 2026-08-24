import { AgentMessageBlock } from "@/types/agent";

export interface ManagedAgentSession {
  agentTemplateId?: string;
  interactionId?: string;
  environmentId?: string;
}

interface ManagedAgentEventCallbacks {
  onBlockAdded: (block: AgentMessageBlock) => void;
  onBlockCompleted: (blockId: string) => void;
  onBlockContent: (blockId: string, content: string) => void;
  onContent: (content: string) => void;
}

const STEP_TITLES: Record<string, string> = {
  thought: "Thoughts",
  code_execution_call: "Code Execution",
  google_search_call: "Grounding with Google Search",
  url_context_call: "URL context",
  function_call: "Function call",
  mcp_server_tool_call: "MCP tool",
  google_maps_call: "Grounding with Google Maps",
  file_search_call: "File search",
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

const stringValue = (record: Record<string, unknown> | null, key: string) => {
  const value = record?.[key];
  return typeof value === "string" ? value : undefined;
};

const numberValue = (record: Record<string, unknown>, key: string) => {
  const value = record[key];
  return typeof value === "number" ? value : undefined;
};

const nestedRecord = (record: Record<string, unknown>, key: string) => asRecord(record[key]);

const thoughtSummaryText = (delta: Record<string, unknown>) => {
  const parts = nestedRecord(delta, "content")?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => stringValue(asRecord(part), "text") ?? "")
    .join("");
};

export function createManagedAgentEventHandler({
  callbacks,
  messageId,
  session,
}: {
  callbacks: ManagedAgentEventCallbacks;
  messageId: string;
  session: ManagedAgentSession;
}) {
  const blockIdsByIndex = new Map<number, string>();
  let streamedContent = "";
  let outputText = "";

  const updateSession = (interaction: Record<string, unknown> | null) => {
    session.interactionId = stringValue(interaction, "id") ?? session.interactionId;
    session.environmentId =
      stringValue(interaction, "environment_id") ?? session.environmentId;
  };

  const handleEvent = (value: unknown) => {
    const event = asRecord(value);
    if (!event) return;

    const eventType = stringValue(event, "event_type") ?? stringValue(event, "type");
    const index = numberValue(event, "index");

    switch (eventType) {
      case "interaction.created":
        updateSession(nestedRecord(event, "interaction"));
        return;
      case "step.start": {
        const stepType = stringValue(nestedRecord(event, "step"), "type") ?? "unknown";
        if (index === undefined || stepType === "model_output" || stepType === "user_input") {
          return;
        }

        const blockId = `block-${messageId}-step-${index}`;
        blockIdsByIndex.set(index, blockId);
        callbacks.onBlockAdded({
          id: blockId,
          type: stepType === "thought" ? "thinking" : "tool_call",
          title: STEP_TITLES[stepType] ?? stepType,
          content: "",
          status: "running",
          timestamp: new Date(),
          collapsible: true,
          defaultCollapsed: false,
          metadata: { toolType: stepType },
        });
        return;
      }
      case "step.delta": {
        const delta = nestedRecord(event, "delta");
        if (!delta) return;

        const blockId = index === undefined ? undefined : blockIdsByIndex.get(index);
        switch (stringValue(delta, "type")) {
          case "text":
            streamedContent += stringValue(delta, "text") ?? "";
            callbacks.onContent(streamedContent);
            return;
          case "thought_summary":
            if (blockId) callbacks.onBlockContent(blockId, thoughtSummaryText(delta));
            return;
          case "code_execution_call":
            if (blockId) {
              callbacks.onBlockContent(
                blockId,
                stringValue(nestedRecord(delta, "arguments"), "code") ?? ""
              );
            }
            return;
          case "google_search_call": {
            const queries = nestedRecord(delta, "arguments")?.queries;
            if (blockId && queries) {
              callbacks.onBlockContent(blockId, `query: ${JSON.stringify(queries)}\n`);
            }
            return;
          }
          case "code_execution_result":
            if (blockId) {
              callbacks.onBlockContent(
                blockId,
                stringValue(nestedRecord(delta, "result"), "output") ?? ""
              );
            }
            return;
          default:
            return;
        }
      }
      case "step.stop": {
        const blockId = index === undefined ? undefined : blockIdsByIndex.get(index);
        if (blockId) callbacks.onBlockCompleted(blockId);
        return;
      }
      case "interaction.completed": {
        const interaction = nestedRecord(event, "interaction");
        updateSession(interaction);
        outputText = stringValue(interaction, "output_text") ?? outputText;
        return;
      }
      case "error":
        throw new Error(
          stringValue(nestedRecord(event, "error"), "message") ?? "Managed agent stream error"
        );
    }
  };

  return {
    getFinalContent: () => streamedContent || outputText,
    handleLine(line: string) {
      if (line.trim()) handleEvent(JSON.parse(line));
    },
  };
}
