import { Agent, AgentMessageBlock } from "./agent";

export interface Model {
  version: string;
  name: string;
  id: string;
  description: string;
  features: string[];
  mode: "text" | "image-content" | "image-endpoint" | "audio" | "video" | "embedding";
  badges?: Array<"New" | "Paid">;
  pricing?: string[];
  knowledgeCutoff?: string;
  releaseDate?: string;
  docsUrl?: string;
  starred?: boolean;
}

export interface GeneratedImage {
  imageBytes: string;
  mimeType?: string;
}

export type ConfigSuggestionType =
  | "add_tool"
  | "remove_tool"
  | "add_mcp"
  | "remove_mcp"
  | "add_trigger"
  | "remove_trigger";

export interface ConfigSuggestion {
  type: ConfigSuggestionType;
  label: string;
  details: string;
  itemId: string;
  status: "pending" | "applied" | "dismissed";
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "model";
  timestamp: Date;
  model?: string;
  executionTime?: number;
  isStreaming?: boolean;
  images?: GeneratedImage[];
  agentBlocks?: AgentMessageBlock[];
  agentName?: string;
  configSuggestions?: ConfigSuggestion[];
}

export interface ImageSettings {
  numberOfImages: number;
  aspectRatio: string;
  personGeneration: "dont_allow" | "allow_adult" | "allow_all";
}

export interface RunSettings {
  systemInstruction: string;
  maxOutputTokens: number;
  temperature: number;
  topP: number;
}

export interface UsageMetrics {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface ChatInterfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedModel?: Model;
  selectedAgent?: Agent;
  imageSettings?: ImageSettings;
  runSettings?: RunSettings;
  apiKeyConfigured?: boolean;
  onModelChange?: (model: Model) => void;
  onAgentSelect?: (agent: Agent) => void;
  onAgentChange?: (agent: Agent) => void;
  browserTab?: "models" | "agents";
  onBrowserTabChange?: (tab: "models" | "agents") => void;
  onBackToHome?: () => void;
}
