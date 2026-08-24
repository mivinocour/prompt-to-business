export type AgentStatus = "draft" | "ready" | "testing" | "deployed";

export type AgentToolType =
  | "web_search"
  | "code_execution"
  | "api_call"
  | "file_reader"
  | "database_query"
  | "email_send"
  | "calendar_access"
  | "slack_integration"
  | "custom_function";

export interface AgentTool {
  id: string;
  name: string;
  type: AgentToolType;
  description: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export type MCPConnectionStatus = "connected" | "disconnected" | "pending";

export interface MCPConnection {
  id: string;
  name: string;
  provider: string;
  icon: string;
  status: MCPConnectionStatus;
  description: string;
}

export interface AgentTrigger {
  id: string;
  type: "schedule" | "webhook" | "email" | "slack_message" | "manual";
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export type WorkflowNodeType =
  | "trigger"
  | "agent"
  | "sub_agent"
  | "tool"
  | "condition"
  | "output";

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  type: WorkflowNodeType;
  icon: string;
  tools?: string[];       // tool names used in this step
  sources?: string[];     // data sources (URLs, services, etc.)
  connectsTo: string[];   // IDs of next steps
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  status: AgentStatus;
  modelId: string;
  managedAgentId?: string;
  systemInstruction: string;
  tools: AgentTool[];
  mcpConnections: MCPConnection[];
  triggers: AgentTrigger[];
  skills: AgentSkill[];
  workflowSteps?: WorkflowStep[];
  instructionSteps?: string[];
  createdAt: Date;
  updatedAt: Date;
  builderPrompt?: string;
  clarifyingAnswers?: Record<string, string>;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: "text" | "multiselect" | "select" | "toggle";
  options?: Array<{ label: string; value: string; icon?: string }>;
  placeholder?: string;
  required: boolean;
  skipLabel?: string;
}

export type AgentMessageBlockType =
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "reasoning_step"
  | "status_update";

export type AgentMessageBlockStatus = "running" | "completed" | "failed";

export interface AgentMessageBlock {
  id: string;
  type: AgentMessageBlockType;
  title: string;
  content: string;
  status: AgentMessageBlockStatus;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, unknown>;
  collapsible: boolean;
  defaultCollapsed: boolean;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  category: string;
  prefilledPrompt: string;
  suggestedTools: AgentToolType[];
  suggestedMCPs: string[];
}
