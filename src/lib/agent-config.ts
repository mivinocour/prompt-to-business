import {
  Agent,
  AgentTemplate,
  AgentTool,
  ClarifyingQuestion,
  MCPConnection,
  AgentTrigger,
  WorkflowStep,
} from "@/types/agent";
import { getInvocationAgentId } from "@/lib/managed-agent-templates";

// ── Available Tools Catalog ──

export const AVAILABLE_TOOLS: AgentTool[] = [
  {
    id: "web-search",
    name: "Web Search",
    type: "web_search",
    description: "Search the web for real-time information using Tavily or Google Search",
    icon: "search",
    enabled: false,
  },
  {
    id: "code-exec",
    name: "Code Execution",
    type: "code_execution",
    description: "Run Python or JavaScript code in a sandboxed environment",
    icon: "terminal",
    enabled: false,
  },
  {
    id: "api-call",
    name: "API Connector",
    type: "api_call",
    description: "Make HTTP requests to external REST or GraphQL APIs",
    icon: "globe",
    enabled: false,
  },
  {
    id: "file-reader",
    name: "File Reader",
    type: "file_reader",
    description: "Read and parse files including PDFs, CSVs, and documents",
    icon: "file-text",
    enabled: false,
  },
  {
    id: "db-query",
    name: "Database Query",
    type: "database_query",
    description: "Execute SQL queries against connected databases",
    icon: "database",
    enabled: false,
  },
  {
    id: "email-send",
    name: "Email Sender",
    type: "email_send",
    description: "Compose and send emails via connected email accounts",
    icon: "mail",
    enabled: false,
  },
  {
    id: "calendar-access",
    name: "Calendar Access",
    type: "calendar_access",
    description: "Read and create calendar events in Google Calendar",
    icon: "calendar",
    enabled: false,
  },
  {
    id: "slack-tool",
    name: "Slack Messaging",
    type: "slack_integration",
    description: "Send messages and read channels in connected Slack workspaces",
    icon: "message-square",
    enabled: false,
  },
];

// ── Available MCP Connections ──

export const AVAILABLE_MCP_CONNECTIONS: MCPConnection[] = [
  {
    id: "slack-mcp",
    name: "Slack",
    provider: "slack",
    icon: "message-square",
    status: "disconnected",
    description: "Connect a Slack bot to receive DMs or channel events",
  },
  {
    id: "gmail-mcp",
    name: "Gmail",
    provider: "gmail",
    icon: "mail",
    status: "disconnected",
    description: "Read, compose, and send emails via Gmail",
  },
  {
    id: "github-mcp",
    name: "GitHub",
    provider: "github",
    icon: "github",
    status: "disconnected",
    description: "Manage repositories, issues, and pull requests",
  },
  {
    id: "gdrive-mcp",
    name: "Google Drive",
    provider: "google-drive",
    icon: "hard-drive",
    status: "disconnected",
    description: "Read and write files in Google Drive",
  },
];

// ── Available Triggers ──

export const DEFAULT_TRIGGERS: AgentTrigger[] = [
  {
    id: "manual-trigger",
    type: "manual",
    name: "Manual",
    description: "Run on demand from the playground",
    icon: "play",
    enabled: true,
  },
  {
    id: "schedule-trigger",
    type: "schedule",
    name: "Scheduled",
    description: "Run on a recurring schedule (cron)",
    icon: "clock",
    enabled: false,
  },
  {
    id: "email-trigger",
    type: "email",
    name: "Email Trigger",
    description: "Triggered when a matching email is received",
    icon: "mail",
    enabled: false,
  },
  {
    id: "slack-trigger",
    type: "slack_message",
    name: "Slack Mention",
    description: "Triggered by @mention in Slack",
    icon: "at-sign",
    enabled: false,
  },
  {
    id: "webhook-trigger",
    type: "webhook",
    name: "Webhook",
    description: "Triggered by an incoming HTTP request",
    icon: "webhook",
    enabled: false,
  },
];

// ── Agent Templates ──

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "research-agent",
    name: "Research Agent",
    description: "Deep web research and analysis with cited sources. Searches multiple databases and produces structured findings.",
    icon: "book-open",
    color: "#3b82f6",
    category: "Research",
    prefilledPrompt:
      "Build an agent that researches topics thoroughly by searching the web, reading articles, and producing concise summaries with source citations.",
    suggestedTools: ["web_search", "file_reader"],
    suggestedMCPs: [],
  },
  {
    id: "email-assistant",
    name: "Email Assistant",
    description: "Smart inbox management. Triages by priority, drafts replies, and escalates urgent items automatically.",
    icon: "mail",
    color: "#ef4444",
    category: "Communication",
    prefilledPrompt:
      "Build an agent that monitors my inbox, categorizes emails by priority, drafts responses for routine messages, and alerts me for urgent items.",
    suggestedTools: ["email_send", "calendar_access"],
    suggestedMCPs: ["gmail-mcp"],
  },
  {
    id: "daily-briefing",
    name: "Daily Briefing",
    description: "Morning summary of your schedule, pending tasks, and personalized news. Delivered to Slack or email.",
    icon: "calendar",
    color: "#f59e0b",
    category: "Productivity",
    prefilledPrompt:
      "Build an agent that prepares a daily briefing each morning with my calendar events, pending tasks, and relevant news headlines.",
    suggestedTools: ["web_search", "calendar_access"],
    suggestedMCPs: ["gmail-mcp"],
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Automated PR reviews with style checks, bug detection, and improvement suggestions for your team.",
    icon: "git-pull-request",
    color: "#22c55e",
    category: "Engineering",
    prefilledPrompt:
      "Build an agent that reviews pull requests on GitHub, checking for code style issues, potential bugs, and suggesting improvements.",
    suggestedTools: ["code_execution", "api_call"],
    suggestedMCPs: ["github-mcp", "slack-mcp"],
  },
  {
    id: "social-monitor",
    name: "Social Media Monitor",
    description: "Real-time brand mention tracking and sentiment analysis across social platforms and news outlets.",
    icon: "radio",
    color: "#8b5cf6",
    category: "Marketing",
    prefilledPrompt:
      "Build an agent that monitors social media platforms for brand mentions, summarizes sentiment, and alerts on trending topics.",
    suggestedTools: ["web_search", "api_call"],
    suggestedMCPs: ["slack-mcp"],
  },
  {
    id: "custom-agent",
    name: "Custom Agent",
    description: "Start from scratch. Define your own tools, triggers, and instructions.",
    icon: "plus",
    color: "#6b7280",
    category: "Custom",
    prefilledPrompt: "",
    suggestedTools: [],
    suggestedMCPs: [],
  },
];

// ── Live AI Studio Agents (matches aistudio.google.com Agents tab 1:1) ──

const AIS_AGENT_TOOLS: AgentTool[] = [
  { ...AVAILABLE_TOOLS[1], enabled: true }, // Code Execution
  { ...AVAILABLE_TOOLS[0], name: "Grounding with Google Search", enabled: true }, // Web Search
  { ...AVAILABLE_TOOLS[2], name: "URL context", enabled: true }, // API Connector as URL context
];

const makeAisAgent = (
  id: string,
  name: string,
  description: string,
  avatar: string,
  systemInstruction: string
): Agent => ({
  id,
  name,
  description,
  avatar,
  status: "deployed",
  modelId: "gemini-3.1-pro-preview",
  managedAgentId: getInvocationAgentId(id),
  systemInstruction,
  tools: AIS_AGENT_TOOLS.map((t) => ({ ...t })),
  mcpConnections: [],
  triggers: [{ ...DEFAULT_TRIGGERS[0], enabled: true }],
  skills: [],
  instructionSteps: [],
  createdAt: new Date("2026-05-01"),
  updatedAt: new Date("2026-05-01"),
});

export const AIS_AGENTS: Agent[] = [
  makeAisAgent(
    "antigravity-preview",
    "Antigravity Preview",
    "A general-purpose autonomous agent running in a remote, Google-hosted Linux environment.",
    "antigravity",
    "You are operating in AI Studio Playground environment. You are a general-purpose autonomous agent running in a remote, Google-hosted Linux environment."
  ),
  makeAisAgent(
    "ai-talk-radio",
    "AI Talk Radio",
    "Transforms a text source into a polished, simulated radio show with hosts, callers, and background music.",
    "radio",
    "You transform a text source into a polished, simulated radio show with hosts, callers, and background music."
  ),
  makeAisAgent(
    "customer-support",
    "Customer Support",
    "Scans a website to build a custom knowledge base and answer support questions using that content.",
    "support",
    "You scan a website to build a custom knowledge base and answer support questions using that content."
  ),
  makeAisAgent(
    "data-analyst",
    "Data Analyst",
    "Delivers interactive business intelligence and data analysis using the Microsoft Northwind dataset.",
    "chart",
    "You deliver interactive business intelligence and data analysis using the Microsoft Northwind dataset."
  ),
  makeAisAgent(
    "document-processor",
    "Document Processor",
    "Reconciles expenses and invoices, verifies vendors, and creates interactive HTML slideshow reports.",
    "description",
    "You reconcile expenses and invoices, verify vendors, and create interactive HTML slideshow reports."
  ),
  makeAisAgent(
    "repo-maintainer",
    "Repo Maintainer",
    "Analyzes your codebase to identify issues, answer questions, and generate bug-fixing patches.",
    "build",
    "You analyze codebases to identify issues, answer questions, and generate bug-fixing patches."
  ),
];

// Zero-state suggestion chips per agent — labels and prompts extracted verbatim from live AI Studio
export const AIS_AGENT_SUGGESTIONS: Record<string, Array<{ label: string; prompt: string }>> = {
  "antigravity-preview": [
    {
      label: "Explore Environment",
      prompt:
        "Use bash commands to explore your environment. Find out what OS and kernel version you are running, check the CPU and memory resources, and see if common tools like Python, pip, and curl are installed.",
    },
    {
      label: "Weather Dashboard",
      prompt:
        "Fetch the current weather and 3-day forecast for London and Ankara from wttr.in (using format=j1 for JSON), parse the data using Python, and generate an interactive HTML dashboard with clean CSS styling saved as 'weather_dashboard.html'.",
    },
    {
      label: "Build Antigravity Game",
      prompt:
        'Create a single-file interactive HTML5/JavaScript game called **"Antigravity"** using **Three.js** (imported via CDN: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`). Save it as `antigravity_game.html`. The entire game, HTML, CSS, JS, shaders, lives in one file. You pilot a glowing neon spaceship through an endless procedural star field. **Gravity wells** (visualized as warping vortexes) pull you in. Your ship has an **antigravity shield** with limited energy — activating it repels nearby gravity wells but drains your shield bar. Navigate as far as possible without being consumed by a gravity well. The game gets progressively harder.',
    },
  ],
  "ai-talk-radio": [
    {
      label: "Daily Hacker Bites",
      prompt: "Generate a 3-minute radio show called Daily Hacker Bites based on top Hacker News stories.",
    },
    {
      label: "GitHub Roundtable for AlphaFold 3",
      prompt:
        "Generate a 3-minute radio with a roundtable concept, educating listeners about https://github.com/google-deepmind/alphafold3.",
    },
    {
      label: "Sports Tournament Debate",
      prompt: "Generate a 3-minute lively sports debate about preparations for a major upcoming tournament.",
    },
  ],
  "customer-support": [
    {
      label: "Gemini API Support Bot",
      prompt: "Build Gemini API customer support bot grounded with ai.google.dev/gemini-api/docs.",
    },
    {
      label: "FastAPI Support Bot",
      prompt: "Build FastAPI customer support bot grounded with fastapi.tiangolo.com.",
    },
    {
      label: "Gemma Support Bot",
      prompt: "Build Gemma customer support bot grounded with https://ai.google.dev/gemma/docs.",
    },
  ],
  "data-analyst": [
    { label: "Biggest Customer", prompt: "Who is my biggest customer?" },
    { label: "Supplier Loss", prompt: "What happens if I lost my biggest supplier next month?" },
    { label: "Revenue Forecast", prompt: "Predict next month's revenue." },
  ],
  "document-processor": [
    {
      label: "Reconcile Expenses",
      prompt: "Reconcile expenses in expenses.csv with the invoices and flag all discrepancies.",
    },
    {
      label: "Verify Vendors",
      prompt: "Are the vendors listed in our expenses real, legitimate businesses?",
    },
    {
      label: "Full Analysis Pipeline",
      prompt: "Run a full analysis: reconcile all expenses and create a vendor cost slideshow.",
    },
  ],
  "repo-maintainer": [
    {
      label: "Repo Overview",
      prompt:
        "Clone https://github.com/googleapis/python-genai and give me an overview of the repository structure and README.",
    },
    {
      label: "Fix Critical Issue",
      prompt:
        "Clone https://github.com/googleapis/python-genai, find the most critical open issue and generate a .patch file to fix it.",
    },
    { label: "Top Issues", prompt: "What are the top open issues for https://github.com/googleapis/python-genai?" },
  ],
};

// Icon tint colors per agent — extracted from live AI Studio
export const AIS_AGENT_COLORS: Record<string, string> = {
  "antigravity-preview": "rgb(252, 189, 0)",
  "ai-talk-radio": "rgb(135, 169, 255)",
  "customer-support": "rgb(197, 151, 255)",
  "data-analyst": "rgb(61, 219, 133)",
  "document-processor": "rgb(215, 58, 73)",
  "repo-maintainer": "rgb(255, 183, 77)",
};

// ── Builder Clarifying Questions ──

const BUILDER_CLARIFYING_QUESTIONS: ClarifyingQuestion[] = [
  {
    id: "data-sources",
    question: "What data sources should the agent have access to?",
    type: "multiselect",
    options: [
      { label: "Web / Search engines", value: "web", icon: "search" },
      { label: "Email (Gmail)", value: "email", icon: "mail" },
      { label: "Slack messages", value: "slack", icon: "message-square" },
      { label: "GitHub repos", value: "github", icon: "github" },
      { label: "Google Drive files", value: "gdrive", icon: "hard-drive" },
      { label: "Custom APIs", value: "api", icon: "globe" },
    ],
    required: false,
    skipLabel: "Skip — I'll configure later",
  },
  {
    id: "response-style",
    question: "How should the agent communicate its results?",
    type: "select",
    options: [
      { label: "Concise bullet points", value: "concise" },
      { label: "Detailed paragraphs", value: "detailed" },
      { label: "Executive summary", value: "executive" },
      { label: "Casual / conversational", value: "casual" },
    ],
    required: false,
    skipLabel: "Skip",
  },
  {
    id: "schedule",
    question: "How often should this agent run?",
    type: "select",
    options: [
      { label: "On demand only", value: "manual" },
      { label: "Every morning at 9 AM", value: "daily-9am" },
      { label: "Every hour", value: "hourly" },
      { label: "When triggered by an event", value: "event" },
    ],
    required: false,
    skipLabel: "Skip",
  },
  {
    id: "output-channel",
    question: "Where should the agent deliver its output?",
    type: "multiselect",
    options: [
      { label: "Chat response here", value: "chat" },
      { label: "Slack channel", value: "slack", icon: "message-square" },
      { label: "Email", value: "email", icon: "mail" },
      { label: "Google Doc", value: "gdoc", icon: "file-text" },
    ],
    required: false,
    skipLabel: "Skip",
  },
];

// ── Builder Steps ──

export const BUILDER_STEPS: { id: string; title: string; description: string }[] = [
  { id: "describe", title: "Describe your agent", description: "Tell us what you want your agent to do." },
  { id: "clarify", title: "Configure preferences", description: "Answer a few questions to help us set things up." },
  { id: "configure", title: "Setting up", description: "We're configuring your agent's tools and connections." },
  { id: "review", title: "Ready to test", description: "Review your agent and start testing." },
];

// ── Simulation Helpers ──

export function selectClarifyingQuestions(description: string): ClarifyingQuestion[] {
  // Always show data sources + at least one more question
  const questions: ClarifyingQuestion[] = [BUILDER_CLARIFYING_QUESTIONS[0]];
  const lower = description.toLowerCase();

  // Add response style for content-heavy agents
  if (lower.includes("summar") || lower.includes("report") || lower.includes("brief") || lower.includes("news") || lower.includes("research")) {
    questions.push(BUILDER_CLARIFYING_QUESTIONS[1]);
  }

  // Add schedule question for recurring tasks
  if (lower.includes("daily") || lower.includes("morning") || lower.includes("monitor") || lower.includes("every") || lower.includes("schedule")) {
    questions.push(BUILDER_CLARIFYING_QUESTIONS[2]);
  }

  // Add output channel question
  if (lower.includes("send") || lower.includes("notify") || lower.includes("email") || lower.includes("slack") || lower.includes("deliver")) {
    questions.push(BUILDER_CLARIFYING_QUESTIONS[3]);
  }

  // Ensure at least 2 questions
  if (questions.length < 2) {
    questions.push(BUILDER_CLARIFYING_QUESTIONS[1]);
  }

  return questions;
}

export function simulateAgentConfiguration(
  description: string,
  answers: Record<string, string | string[]>
): Partial<Agent> {
  const tools: AgentTool[] = [];
  const mcps: MCPConnection[] = [];
  const triggers: AgentTrigger[] = [{ ...DEFAULT_TRIGGERS[0], enabled: true }]; // Always include manual
  const lower = description.toLowerCase();

  // Auto-select tools based on description keywords
  if (lower.includes("search") || lower.includes("research") || lower.includes("find") || lower.includes("news") || lower.includes("web")) {
    tools.push({ ...AVAILABLE_TOOLS[0], enabled: true }); // Web Search
  }
  if (lower.includes("code") || lower.includes("review") || lower.includes("run") || lower.includes("execute")) {
    tools.push({ ...AVAILABLE_TOOLS[1], enabled: true }); // Code Execution
  }
  if (lower.includes("api") || lower.includes("fetch") || lower.includes("connect")) {
    tools.push({ ...AVAILABLE_TOOLS[2], enabled: true }); // API Connector
  }
  if (lower.includes("file") || lower.includes("document") || lower.includes("pdf") || lower.includes("read")) {
    tools.push({ ...AVAILABLE_TOOLS[3], enabled: true }); // File Reader
  }
  if (lower.includes("email") || lower.includes("mail") || lower.includes("send")) {
    tools.push({ ...AVAILABLE_TOOLS[5], enabled: true }); // Email Sender
    mcps.push({ ...AVAILABLE_MCP_CONNECTIONS[1], status: "connected" }); // Gmail
  }
  if (lower.includes("calendar") || lower.includes("schedule") || lower.includes("meeting")) {
    tools.push({ ...AVAILABLE_TOOLS[6], enabled: true }); // Calendar Access
  }
  if (lower.includes("slack") || lower.includes("message") || lower.includes("channel")) {
    tools.push({ ...AVAILABLE_TOOLS[7], enabled: true }); // Slack Messaging
    mcps.push({ ...AVAILABLE_MCP_CONNECTIONS[0], status: "connected" }); // Slack
  }
  if (lower.includes("github") || lower.includes("repo") || lower.includes("pr") || lower.includes("pull request")) {
    mcps.push({ ...AVAILABLE_MCP_CONNECTIONS[2], status: "connected" }); // GitHub
  }

  // Process answers for data sources
  const dataSources = answers["data-sources"];
  if (Array.isArray(dataSources)) {
    if (dataSources.includes("web") && !tools.find((t) => t.type === "web_search")) {
      tools.push({ ...AVAILABLE_TOOLS[0], enabled: true });
    }
    if (dataSources.includes("email") && !mcps.find((m) => m.provider === "gmail")) {
      tools.push({ ...AVAILABLE_TOOLS[5], enabled: true });
      mcps.push({ ...AVAILABLE_MCP_CONNECTIONS[1], status: "connected" });
    }
    if (dataSources.includes("slack") && !mcps.find((m) => m.provider === "slack")) {
      tools.push({ ...AVAILABLE_TOOLS[7], enabled: true });
      mcps.push({ ...AVAILABLE_MCP_CONNECTIONS[0], status: "connected" });
    }
    if (dataSources.includes("github") && !mcps.find((m) => m.provider === "github")) {
      mcps.push({ ...AVAILABLE_MCP_CONNECTIONS[2], status: "connected" });
    }
    if (dataSources.includes("gdrive") && !mcps.find((m) => m.provider === "google-drive")) {
      mcps.push({ ...AVAILABLE_MCP_CONNECTIONS[3], status: "connected" });
    }
  }

  // Process schedule answers
  const schedule = answers["schedule"];
  if (schedule === "daily-9am") {
    triggers.push({ ...DEFAULT_TRIGGERS[1], enabled: true, config: { cron: "0 9 * * *" } });
  } else if (schedule === "hourly") {
    triggers.push({ ...DEFAULT_TRIGGERS[1], enabled: true, config: { cron: "0 * * * *" } });
  } else if (schedule === "event") {
    triggers.push({ ...DEFAULT_TRIGGERS[4], enabled: true }); // Webhook
  }

  // Ensure at least one tool
  if (tools.length === 0) {
    tools.push({ ...AVAILABLE_TOOLS[0], enabled: true }); // Default to Web Search
  }

  // Generate a name from the description
  const words = description.split(/\s+/).slice(0, 5);
  const name = words.length > 3
    ? words.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    : "Custom Agent";

  // Generate workflow steps from the selected tools/triggers
  const workflowSteps = generateFallbackWorkflow(description, tools, mcps, triggers);
  const instructionSteps = generateFallbackInstructions(description, tools, triggers);

  // Format instruction steps as markdown appended to system instruction
  let systemInstruction = `You are an AI agent. Your task: ${description}\n\nBe thorough, cite sources when possible, and present information clearly.`;
  if (instructionSteps.length >= 2) {
    systemInstruction += `\n\n## Agent Instructions\n${instructionSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
  }

  return {
    name,
    description: description.length > 100 ? description.substring(0, 100) + "..." : description,
    tools,
    mcpConnections: mcps,
    triggers,
    modelId: "gemini-3.1-pro-preview",
    systemInstruction,
    status: "ready",
    avatar: tools.find((t) => t.type === "web_search") ? "search" : tools.find((t) => t.type === "code_execution") ? "terminal" : "bot",
    workflowSteps,
    instructionSteps,
  };
}

// ── Fallback Workflow Generator ──

function generateFallbackWorkflow(
  description: string,
  tools: AgentTool[],
  mcps: MCPConnection[],
  triggers: AgentTrigger[]
): WorkflowStep[] {
  const steps: WorkflowStep[] = [];
  const lower = description.toLowerCase();

  // 1. Trigger node
  const hasCron = triggers.some((t) => t.type === "schedule");
  const hasWebhook = triggers.some((t) => t.type === "webhook");
  steps.push({
    id: "trigger",
    label: hasCron ? "Scheduled Run" : hasWebhook ? "Webhook Trigger" : "Manual Start",
    description: hasCron
      ? "Runs on the configured cron schedule"
      : hasWebhook
        ? "Triggered by incoming webhook event"
        : "Initiated by user in playground",
    type: "trigger",
    icon: hasCron ? "clock" : hasWebhook ? "webhook" : "play",
    connectsTo: ["gather-data"],
  });

  // 2. Data gathering step — based on tools
  const hasSearch = tools.some((t) => t.type === "web_search");
  const hasFileReader = tools.some((t) => t.type === "file_reader");
  const hasApi = tools.some((t) => t.type === "api_call");

  const sources: string[] = [];
  if (hasSearch) {
    if (lower.includes("hacker news") || lower.includes("hn")) sources.push("news.ycombinator.com");
    if (lower.includes("reddit")) sources.push("reddit.com");
    if (lower.includes("news")) sources.push("Google News");
    if (lower.includes("tech")) sources.push("TechCrunch");
    if (sources.length === 0) sources.push("Web Search");
  }
  if (hasFileReader) sources.push("Local files");
  if (hasApi) sources.push("External APIs");

  const gatherTools: string[] = [];
  if (hasSearch) gatherTools.push("Web Search");
  if (hasFileReader) gatherTools.push("File Reader");
  if (hasApi) gatherTools.push("API Connector");

  steps.push({
    id: "gather-data",
    label: hasSearch ? "Research & Fetch" : "Gather Data",
    description: sources.length > 0
      ? `Fetches data from ${sources.join(", ")}`
      : `Collects relevant data for: ${description.substring(0, 60)}`,
    type: "sub_agent",
    icon: hasSearch ? "search" : "database",
    tools: gatherTools.length > 0 ? gatherTools : undefined,
    sources: sources.length > 0 ? sources : undefined,
    connectsTo: ["process"],
  });

  // 3. Processing/analysis step
  steps.push({
    id: "process",
    label: lower.includes("code") ? "Analyze Code" : lower.includes("summar") ? "Summarize" : "Process & Filter",
    description: lower.includes("code")
      ? "Analyzes code for issues, patterns, and improvements"
      : lower.includes("summar")
        ? "Summarizes and highlights the most relevant findings"
        : "Filters, deduplicates, and ranks results by relevance",
    type: "sub_agent",
    icon: lower.includes("code") ? "terminal" : "bot",
    connectsTo: ["format"],
  });

  // 4. Formatting step
  steps.push({
    id: "format",
    label: "Format Output",
    description: lower.includes("bullet")
      ? "Formats results as concise bullet points"
      : "Structures results into a clear, readable format",
    type: "tool",
    icon: "file-text",
    connectsTo: ["deliver"],
  });

  // 5. Delivery step — based on outputs
  const hasSlack = tools.some((t) => t.type === "slack_integration") || mcps.some((m) => m.provider === "slack");
  const hasEmail = tools.some((t) => t.type === "email_send") || mcps.some((m) => m.provider === "gmail");

  const outputTools: string[] = [];
  if (hasSlack) outputTools.push("Slack");
  if (hasEmail) outputTools.push("Email");

  steps.push({
    id: "deliver",
    label: hasSlack ? "Send to Slack" : hasEmail ? "Send Email" : "Return Results",
    description: hasSlack
      ? "Posts formatted summary to the configured Slack channel"
      : hasEmail
        ? "Sends formatted summary via email to recipients"
        : "Returns the formatted results to the user",
    type: "output",
    icon: hasSlack ? "message-square" : hasEmail ? "mail" : "play",
    tools: outputTools.length > 0 ? outputTools : undefined,
    connectsTo: [],
  });

  return steps;
}

// ── Fallback Instructions Generator ──

function generateFallbackInstructions(
  description: string,
  tools: AgentTool[],
  triggers: AgentTrigger[]
): string[] {
  const steps: string[] = [];
  const lower = description.toLowerCase();

  // 1. Trigger step
  const hasCron = triggers.some((t) => t.type === "schedule" && t.enabled);
  const hasSlackTrigger = triggers.some((t) => t.type === "slack_message" && t.enabled);
  const hasEmailTrigger = triggers.some((t) => t.type === "email" && t.enabled);
  const hasWebhook = triggers.some((t) => t.type === "webhook" && t.enabled);

  if (hasCron) {
    steps.push("Activate on the configured schedule trigger");
  } else if (hasSlackTrigger) {
    steps.push("Listen for @mentions in the connected Slack channel");
  } else if (hasEmailTrigger) {
    steps.push("Monitor inbox for matching incoming emails");
  } else if (hasWebhook) {
    steps.push("Wait for incoming webhook event to trigger execution");
  } else {
    steps.push("Start when manually triggered by the user");
  }

  // 2. Data gathering
  const hasSearch = tools.some((t) => t.type === "web_search");
  const hasFileReader = tools.some((t) => t.type === "file_reader");
  const hasApi = tools.some((t) => t.type === "api_call");
  const hasDb = tools.some((t) => t.type === "database_query");

  if (hasSearch) {
    if (lower.includes("news") || lower.includes("headline")) {
      steps.push("Search the web for latest news and headlines from relevant sources");
    } else if (lower.includes("research")) {
      steps.push("Conduct deep web research across multiple sources and databases");
    } else {
      steps.push("Search the web for relevant, up-to-date information");
    }
  }
  if (hasFileReader) {
    steps.push("Read and parse relevant documents and files");
  }
  if (hasApi) {
    steps.push("Fetch data from connected external APIs");
  }
  if (hasDb) {
    steps.push("Query connected databases for structured data");
  }

  // 3. Processing step
  if (lower.includes("summar")) {
    steps.push("Summarize findings into concise, actionable insights");
  } else if (lower.includes("review") || lower.includes("analyz")) {
    steps.push("Analyze and evaluate results against defined criteria");
  } else if (lower.includes("filter") || lower.includes("monitor")) {
    steps.push("Filter and deduplicate results by relevance and priority");
  } else {
    steps.push("Process and organize the collected information");
  }

  // 4. Output/delivery step
  const hasSlackTool = tools.some((t) => t.type === "slack_integration");
  const hasEmail = tools.some((t) => t.type === "email_send");

  if (hasSlackTool) {
    steps.push("Deliver formatted results to the configured Slack channel");
  } else if (hasEmail) {
    steps.push("Send a formatted summary via email to recipients");
  } else {
    steps.push("Present the formatted results to the user");
  }

  // Ensure 4-6 steps — add a formatting step if we're short
  if (steps.length < 4) {
    steps.splice(steps.length - 1, 0, "Format output into a clear, readable structure");
  }

  return steps;
}

// ── Agent System Prompt Builder ──

export function buildAgentSystemPrompt(agent: Agent): string {
  const enabledTools = agent.tools.filter((t) => t.enabled);
  const connectedMCPs = agent.mcpConnections.filter((m) => m.status === "connected");
  const enabledTriggers = agent.triggers.filter((t) => t.enabled);

  const hasWebSearch = enabledTools.some(
    (t) => t.id === "web-search" || t.type === "web_search" || t.name.toLowerCase().includes("search")
  );

  const toolsList =
    enabledTools.length > 0
      ? enabledTools.map((t) => `- ${t.name}: ${t.description}`).join("\n")
      : "- No tools currently enabled";

  const mcpsList =
    connectedMCPs.length > 0
      ? connectedMCPs.map((m) => `- ${m.name} (${m.status}): ${m.description}`).join("\n")
      : "- No services currently connected";

  const triggersList =
    enabledTriggers.length > 0
      ? enabledTriggers.map((t) => `- ${t.name}: ${t.description}`).join("\n")
      : "- Manual trigger only";

  const groundingNote = hasWebSearch
    ? `\n\nIMPORTANT — LIVE WEB SEARCH:
You have Google Search grounding enabled. When the user asks for current information, news, real-time data, or anything that benefits from live web results, you MUST use your search capability to fetch real, up-to-date information. Do NOT make up or fabricate results. Provide actual headlines, actual sources, and actual data from your search results. Always cite your sources with the publication name. Present the information in a clean, organized format.`
    : "";

  return `${agent.systemInstruction}

---
AGENT CONFIGURATION CONTEXT:

You are "${agent.name}" — an AI agent running in a playground environment.

Your enabled tools:
${toolsList}

Your connected services (MCP):
${mcpsList}

Your triggers:
${triggersList}${groundingNote}

BEHAVIOR GUIDELINES:
- When the user asks you to perform a task, execute it directly using your available tools. Provide real results, not hypothetical descriptions of what you would do.${hasWebSearch ? "\n- Use Google Search to fetch real, current information. Always include source names." : ""}
- If a tool or service isn't configured or connected, mention this and suggest alternatives or ask the user how they'd like to proceed.
- Be proactive about asking clarifying questions when the user's request is ambiguous.
- You can suggest changes to your own configuration (adding/removing tools, changing triggers, updating your instructions).
- Keep responses concise but thorough. Use markdown formatting.`;
}
