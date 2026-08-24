import { GoogleGenAI, PersonGeneration } from "@google/genai";
import { getModelById } from "@/lib/chat-config";
import { ConfigSuggestionType, ImageSettings, RunSettings } from "@/types/chat";
import { ClarifyingQuestion } from "@/types/agent";
import {
  AVAILABLE_TOOLS,
  AVAILABLE_MCP_CONNECTIONS,
  DEFAULT_TRIGGERS,
} from "@/lib/agent-config";

export const runtime = "nodejs";

type HistoryMessage = {
  role: "user" | "model";
  content: string;
};

type GeminiRequestBody =
  | {
      operation: "text";
      history: HistoryMessage[];
      modelId: string;
      prompt: string;
      runSettings: RunSettings;
      enableGrounding?: boolean;
    }
  | {
      operation: "images";
      imageSettings: ImageSettings;
      modelId: string;
      prompt: string;
    }
  | {
      operation: "title";
      assistantResponse: string;
      userPrompt: string;
    }
  | {
      operation: "clarify";
      description: string;
    }
  | {
      operation: "agent-config";
      description: string;
      questions: ClarifyingQuestion[];
      answers: Record<string, string | string[]>;
    }
  | {
      operation: "config-assist";
      agent: Record<string, unknown>;
      request: string;
    };

const jsonError = (message: string, status: number) =>
  Response.json({ error: message }, { status });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isHistory = (value: unknown): value is HistoryMessage[] =>
  Array.isArray(value) &&
  value.every(
    (message) =>
      isRecord(message) &&
      (message.role === "user" || message.role === "model") &&
      typeof message.content === "string"
  );

const isRunSettings = (value: unknown): value is RunSettings =>
  isRecord(value) &&
  typeof value.systemInstruction === "string" &&
  typeof value.maxOutputTokens === "number" &&
  Number.isFinite(value.maxOutputTokens) &&
  typeof value.temperature === "number" &&
  Number.isFinite(value.temperature) &&
  typeof value.topP === "number" &&
  Number.isFinite(value.topP);

const isImageSettings = (value: unknown): value is ImageSettings =>
  isRecord(value) &&
  typeof value.numberOfImages === "number" &&
  Number.isInteger(value.numberOfImages) &&
  value.numberOfImages > 0 &&
  typeof value.aspectRatio === "string" &&
  ["dont_allow", "allow_adult", "allow_all"].includes(String(value.personGeneration));

const isClarifyingQuestions = (value: unknown): value is ClarifyingQuestion[] =>
  Array.isArray(value) &&
  value.every(
    (question) =>
      isRecord(question) &&
      typeof question.id === "string" &&
      typeof question.question === "string" &&
      typeof question.type === "string"
  );

const isClarifyingAnswers = (
  value: unknown
): value is Record<string, string | string[]> =>
  isRecord(value) &&
  Object.values(value).every(
    (answer) =>
      typeof answer === "string" ||
      (Array.isArray(answer) && answer.every((item) => typeof item === "string"))
  );

const parseRequestBody = (value: unknown): GeminiRequestBody | null => {
  if (!isRecord(value) || typeof value.operation !== "string") return null;

  switch (value.operation) {
    case "text":
      return typeof value.modelId === "string" &&
        typeof value.prompt === "string" &&
        isHistory(value.history) &&
        isRunSettings(value.runSettings)
        ? {
            operation: "text",
            history: value.history,
            modelId: value.modelId,
            prompt: value.prompt,
            runSettings: value.runSettings,
            enableGrounding: value.enableGrounding === true,
          }
        : null;
    case "images":
      return typeof value.modelId === "string" &&
        typeof value.prompt === "string" &&
        isImageSettings(value.imageSettings)
        ? {
            operation: "images",
            imageSettings: value.imageSettings,
            modelId: value.modelId,
            prompt: value.prompt,
          }
        : null;
    case "title":
      return typeof value.assistantResponse === "string" && typeof value.userPrompt === "string"
        ? {
            operation: "title",
            assistantResponse: value.assistantResponse,
            userPrompt: value.userPrompt,
          }
        : null;
    case "clarify":
      return typeof value.description === "string"
        ? { operation: "clarify", description: value.description }
        : null;
    case "agent-config":
      return typeof value.description === "string" &&
        isClarifyingQuestions(value.questions) &&
        isClarifyingAnswers(value.answers)
        ? {
            operation: "agent-config",
            description: value.description,
            questions: value.questions,
            answers: value.answers,
          }
        : null;
    case "config-assist":
      return isRecord(value.agent) && typeof value.request === "string"
        ? { operation: "config-assist", agent: value.agent, request: value.request }
        : null;
    default:
      return null;
  }
};

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY on the server.");
  }

  return new GoogleGenAI({ apiKey });
};

const normalizeHistory = (history: HistoryMessage[]) =>
  history
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      parts: [{ text: message.content }],
    }));

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const PERSON_GENERATION: Record<ImageSettings["personGeneration"], PersonGeneration> = {
  dont_allow: PersonGeneration.DONT_ALLOW,
  allow_adult: PersonGeneration.ALLOW_ADULT,
  allow_all: PersonGeneration.ALLOW_ALL,
};

async function handleTextRequest(body: Extract<GeminiRequestBody, { operation: "text" }>) {
  const model = getModelById(body.modelId);

  if (!model || model.mode !== "text") {
    return jsonError("That model is not available for text chat in this prototype.", 400);
  }

  const ai = getClient();
  const chat = ai.chats.create({
    model: body.modelId,
    config: {
      systemInstruction: body.runSettings.systemInstruction,
      maxOutputTokens: body.runSettings.maxOutputTokens,
      temperature: body.runSettings.temperature,
      topP: body.runSettings.topP,
      ...(body.enableGrounding ? { tools: [{ googleSearch: {} }] } : {}),
    },
    history: normalizeHistory(body.history),
  });
  const result = await chat.sendMessageStream({
    message: body.prompt,
  });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result) {
          const text = chunk.text || "";

          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

async function handleImageRequest(body: Extract<GeminiRequestBody, { operation: "images" }>) {
  const model = getModelById(body.modelId);

  if (!model || (model.mode !== "image-content" && model.mode !== "image-endpoint")) {
    return jsonError("That model is not available for image generation in this prototype.", 400);
  }

  const ai = getClient();

  if (model.mode === "image-endpoint") {
    const response = await ai.models.generateImages({
      model: body.modelId,
      prompt: body.prompt,
      config: {
        numberOfImages: body.imageSettings.numberOfImages,
        aspectRatio: body.imageSettings.aspectRatio,
        personGeneration: PERSON_GENERATION[body.imageSettings.personGeneration],
      },
    });

    const images =
      response.generatedImages
        ?.map((image) => ({
          imageBytes: image.image?.imageBytes || "",
          mimeType: image.image?.mimeType || "image/png",
        }))
        .filter((image) => image.imageBytes) ?? [];

    return Response.json({
      images,
      text: `Generated ${images.length} images`,
    });
  }

  const response = await ai.models.generateContent({
    model: body.modelId,
    contents: body.prompt,
  });
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const images = parts
    .filter((part) => part.inlineData?.data)
    .map((part) => ({
      imageBytes: part.inlineData?.data || "",
      mimeType: part.inlineData?.mimeType || "image/png",
    }))
    .filter((image) => image.imageBytes);
  const text = parts
    .map((part) => part.text?.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  return Response.json({
    images,
    text: text || `Generated ${images.length} images`,
  });
}

async function handleTitleRequest(body: Extract<GeminiRequestBody, { operation: "title" }>) {
  const ai = getClient();
  const titleModel = process.env.GEMINI_MODEL_FLASH || "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model: titleModel,
    contents: `Based on this conversation between a user and an AI assistant, generate a short, descriptive title for this chat session (exactly 3-4 words). This title will be used in the conversation history sidebar.

User message: "${body.userPrompt}"
AI response: "${body.assistantResponse.substring(0, 200)}..."

Requirements:
- Exactly 3-4 words
- Descriptive of the main topic
- No quotes or special characters
- Suitable for a chat history title

Examples: "Python Calculator App", "REST API Design", "React Component Build", "Data Analysis Script"

Title:`,
    config: {
      maxOutputTokens: 50,
      temperature: 0.3,
    },
  });
  const title =
    response.text?.trim().replace(/['"]/g, "").replace(/^Title:\s*/, "") || "New Chat";

  return Response.json({ title });
}

// ── Builder helpers ──

const BUILDER_MODEL = process.env.GEMINI_MODEL_FLASH || "gemini-3-flash-preview";

const VALID_ICONS = [
  "search", "terminal", "globe", "file-text", "database", "mail",
  "calendar", "message-square", "book-open", "git-pull-request",
  "radio", "clock", "play", "at-sign", "webhook", "hard-drive",
  "github", "bot", "sparkles",
];

async function handleClarifyRequest(body: Extract<GeminiRequestBody, { operation: "clarify" }>) {
  const ai = getClient();

  const prompt = `You are an AI agent builder assistant. Given the following description of an agent a user wants to create, generate 2-4 clarifying questions that are SPECIFIC to this agent.

Agent description: "${body.description}"

CRITICAL RULES:
- Questions MUST be specific to what this agent does. NOT generic questions like "What data sources?" or "How should it communicate?"
- Think about what you'd actually need to know to build this specific agent well.
- For example, if the user says "daily news briefing agent", ask things like "What topics should it cover?", "Which news sources do you prefer?", "What time should it deliver the briefing?"
- For a "code review agent", ask things like "Which programming languages?", "What review criteria matter most?", "Should it auto-comment on PRs?"

Return a JSON object with a "questions" array. Each question must have:
- "id": a unique kebab-case identifier (e.g., "news-topics", "delivery-time")
- "question": the question text
- "type": one of "text", "multiselect", or "select"
- "options": (required for multiselect/select) array of { "label": string, "value": string, "icon": string (optional) }
  - Valid icon names: ${VALID_ICONS.join(", ")}
- "placeholder": (optional, for text type) placeholder text
- "required": always false
- "skipLabel": always "Skip"

Guidelines:
- Use "multiselect" when the user could pick multiple items (topics, features, sources)
- Use "select" for single-choice questions (frequency, format, style)
- Use "text" for open-ended input (custom instructions, specific details)
- Provide 3-6 options for multiselect/select questions
- Make option labels concise (2-4 words each)

Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: BUILDER_MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();
  if (!text) {
    return jsonError("Empty response from model.", 422);
  }

  let parsed: { questions?: unknown[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    return jsonError("Malformed JSON response from model.", 422);
  }

  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    return jsonError("No questions generated.", 422);
  }

  // Validate and sanitize each question
  const validated: ClarifyingQuestion[] = [];
  for (const raw of parsed.questions.slice(0, 4)) {
    const q = raw as Record<string, unknown>;
    if (!q.id || !q.question || !q.type) continue;
    if (!["text", "multiselect", "select"].includes(q.type as string)) continue;

    const question: ClarifyingQuestion = {
      id: q.id as string,
      question: q.question as string,
      type: q.type as "text" | "multiselect" | "select",
      required: false,
      skipLabel: "Skip",
    };

    if (q.placeholder && typeof q.placeholder === "string") {
      question.placeholder = q.placeholder;
    }

    if ((q.type === "multiselect" || q.type === "select") && Array.isArray(q.options)) {
      const options = (q.options as Array<Record<string, unknown>>)
        .filter((opt) => opt.label && opt.value)
        .map((opt) => ({
          label: String(opt.label),
          value: String(opt.value),
          ...(opt.icon && VALID_ICONS.includes(String(opt.icon))
            ? { icon: String(opt.icon) }
            : {}),
        }));

      if (options.length < 2) continue; // Skip questions with too few options
      question.options = options;
    }

    validated.push(question);
  }

  if (validated.length < 2) {
    return jsonError("Insufficient valid questions generated.", 422);
  }

  return Response.json({ questions: validated });
}

async function handleAgentConfigRequest(
  body: Extract<GeminiRequestBody, { operation: "agent-config" }>
) {
  const ai = getClient();

  // Build the Q&A context
  const qaContext = body.questions
    .map((q) => {
      const answer = body.answers[q.id];
      const answerText = Array.isArray(answer) ? answer.join(", ") : answer || "(skipped)";
      return `Q: ${q.question}\nA: ${answerText}`;
    })
    .join("\n\n");

  const prompt = `You are an AI agent builder. Based on the agent description and the user's answers to clarifying questions, generate a complete agent configuration.

Agent description: "${body.description}"

User's preferences:
${qaContext}

AVAILABLE TOOLS (use these exact IDs):
${AVAILABLE_TOOLS.map((t) => `- "${t.id}": ${t.name} — ${t.description}`).join("\n")}

AVAILABLE MCP CONNECTIONS (use these exact IDs):
${AVAILABLE_MCP_CONNECTIONS.map((m) => `- "${m.id}": ${m.name} — ${m.description}`).join("\n")}

AVAILABLE TRIGGERS (use these exact IDs, always include "manual-trigger"):
${DEFAULT_TRIGGERS.map((t) => `- "${t.id}": ${t.name} — ${t.description}`).join("\n")}

AVAILABLE MODELS:
- "gemini-3.1-pro-preview": Best for complex reasoning and multi-step tasks
- "gemini-3-flash-preview": Fast and capable for most tasks
- "gemini-3.1-flash-lite": Lightweight, fastest responses

Return a JSON object with:
- "name": a short, catchy agent name (2-4 words)
- "description": one sentence describing what it does
- "avatar": an icon name from this list: search, terminal, globe, file-text, database, mail, calendar, message-square, book-open, git-pull-request, radio, clock, bot, sparkles
- "modelId": one of the model IDs listed above (pick based on task complexity)
- "systemInstruction": 2-4 paragraphs of detailed instructions for the agent. Be very specific about:
  - What the agent should do step-by-step
  - How it should format its output
  - What tone/style to use
  - Any constraints or guardrails
  - How to handle edge cases
- "toolIds": array of tool IDs from the list above that this agent needs
- "mcpIds": array of MCP connection IDs from the list above (only if needed)
- "triggerIds": array of trigger IDs (always include "manual-trigger")
- "workflowSteps": an array of 4-7 objects describing the agent's actual execution workflow as a DAG. Each step is:
  {
    "id": unique kebab-case id (e.g. "fetch-news", "filter-articles"),
    "label": short name (2-4 words, e.g. "News Researcher"),
    "description": one sentence of what this step does specifically (e.g. "Crawls Hacker News front page and /newest for AI-related posts"),
    "type": one of "trigger", "agent", "sub_agent", "tool", "condition", "output",
    "icon": icon name from the valid icons list,
    "tools": array of tool names used (e.g. ["Web Search"]) - optional,
    "sources": array of specific data sources (e.g. ["news.ycombinator.com", "TechCrunch API"]) - optional,
    "connectsTo": array of step IDs this flows into (e.g. ["filter-articles"])
  }

  CRITICAL: The workflow must tell the story of HOW this agent accomplishes its task.
  - Start with a "trigger" type node (what kicks it off)
  - Use "sub_agent" for distinct research/processing phases
  - Use "tool" for specific tool usage steps (which tool, which source)
  - Use "condition" for branching/filtering logic
  - End with "output" for the final delivery step
  - Be SPECIFIC: instead of "searches the web", say "Fetches AI headlines from Hacker News and TechCrunch"
  - Include real source names, real tool references, real processing steps
  - The connectsTo fields must form a valid DAG (directed, no cycles)

- "instructionSteps": an array of 4-6 short imperative sentences describing what the agent does step-by-step (shown as a checklist). E.g.:
  ["Activate on the configured morning schedule", "Search Hacker News and TechCrunch for AI headlines", "Filter and deduplicate articles by topic", "Summarize each article in 2-3 sentences", "Post formatted briefing to Slack"]
  CRITICAL: Each step should be concise (under 15 words) and action-oriented.

Return ONLY valid JSON.`;

  const response = await ai.models.generateContent({
    model: BUILDER_MODEL,
    contents: prompt,
    config: {
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();
  if (!text) {
    return jsonError("Empty response from model.", 422);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    return jsonError("Malformed JSON response from model.", 422);
  }

  // Map tool IDs to full tool objects
  const toolIds = Array.isArray(parsed.toolIds) ? (parsed.toolIds as string[]) : [];
  const tools = toolIds
    .map((id) => AVAILABLE_TOOLS.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => ({ ...t!, enabled: true }));

  // Ensure at least one tool
  if (tools.length === 0) {
    tools.push({ ...AVAILABLE_TOOLS[0], enabled: true });
  }

  // Map MCP IDs to full connection objects
  const mcpIds = Array.isArray(parsed.mcpIds) ? (parsed.mcpIds as string[]) : [];
  const mcpConnections = mcpIds
    .map((id) => AVAILABLE_MCP_CONNECTIONS.find((m) => m.id === id))
    .filter(Boolean)
    .map((m) => ({ ...m!, status: "connected" as const }));

  // Map trigger IDs to full trigger objects
  const triggerIds = Array.isArray(parsed.triggerIds) ? (parsed.triggerIds as string[]) : [];
  const triggers = triggerIds
    .map((id) => DEFAULT_TRIGGERS.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => ({ ...t!, enabled: true }));

  // Always ensure manual trigger is present
  if (!triggers.find((t) => t.id === "manual-trigger")) {
    triggers.unshift({ ...DEFAULT_TRIGGERS[0], enabled: true });
  }

  // Pick a valid avatar or default to "bot"
  const avatar =
    typeof parsed.avatar === "string" && VALID_ICONS.includes(parsed.avatar)
      ? parsed.avatar
      : "bot";

  // Parse and validate workflow steps
  const rawSteps = Array.isArray(parsed.workflowSteps) ? parsed.workflowSteps : [];
  const validNodeTypes = ["trigger", "agent", "sub_agent", "tool", "condition", "output"];
  const workflowSteps: import("@/types/agent").WorkflowStep[] = rawSteps
    .filter((s: Record<string, unknown>) => s.id && s.label && s.type)
    .map((s: Record<string, unknown>) => ({
      id: String(s.id),
      label: String(s.label),
      description: typeof s.description === "string" ? s.description : "",
      type: validNodeTypes.includes(String(s.type))
        ? (String(s.type) as import("@/types/agent").WorkflowNodeType)
        : "agent",
      icon:
        typeof s.icon === "string" && VALID_ICONS.includes(s.icon)
          ? s.icon
          : "bot",
      tools: Array.isArray(s.tools) ? s.tools.map(String) : undefined,
      sources: Array.isArray(s.sources) ? s.sources.map(String) : undefined,
      connectsTo: Array.isArray(s.connectsTo) ? s.connectsTo.map(String) : [],
    }));

  // Parse instruction steps
  const rawInstructions = Array.isArray(parsed.instructionSteps) ? parsed.instructionSteps : [];
  const instructionSteps: string[] = rawInstructions
    .filter((s: unknown) => typeof s === "string" && (s as string).length > 5)
    .map((s: unknown) => String(s));

  const config: Partial<import("@/types/agent").Agent> = {
    name: typeof parsed.name === "string" ? parsed.name : "Custom Agent",
    description: typeof parsed.description === "string" ? parsed.description : body.description,
    avatar,
    modelId: typeof parsed.modelId === "string" ? parsed.modelId : "gemini-3.1-pro-preview",
    systemInstruction:
      typeof parsed.systemInstruction === "string"
        ? parsed.systemInstruction
        : `You are an AI agent. Your task: ${body.description}`,
    tools,
    mcpConnections,
    triggers,
    workflowSteps: workflowSteps.length >= 3 ? workflowSteps : undefined,
    instructionSteps: instructionSteps.length >= 3 ? instructionSteps : undefined,
    status: "ready",
  };

  return Response.json({ config });
}

async function handleConfigAssistRequest(
  body: Extract<GeminiRequestBody, { operation: "config-assist" }>
) {
  const ai = getClient();

  const agent = body.agent;
  const namesFrom = (value: unknown, enabledOnly = false) => {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
      if (!isRecord(item) || typeof item.name !== "string") return [];
      if (enabledOnly && item.enabled !== true) return [];
      return [item.name];
    });
  };
  const currentTools = namesFrom(agent.tools).join(", ") || "None";
  const currentMcps = namesFrom(agent.mcpConnections).join(", ") || "None";
  const currentTriggers = namesFrom(agent.triggers, true).join(", ") || "Manual";
  const agentName = typeof agent.name === "string" ? agent.name : "Unnamed";

  const prompt = `You are a configuration assistant for an AI agent builder. The user wants to modify their agent's configuration.

Current agent config:
- Name: ${agentName}
- Tools: ${currentTools}
- Connections: ${currentMcps}
- Triggers: ${currentTriggers}

AVAILABLE TOOLS (use these exact IDs):
${AVAILABLE_TOOLS.map((t) => `- "${t.id}": ${t.name} — ${t.description}`).join("\n")}

AVAILABLE MCP CONNECTIONS (use these exact IDs):
${AVAILABLE_MCP_CONNECTIONS.map((m) => `- "${m.id}": ${m.name} — ${m.description}`).join("\n")}

AVAILABLE TRIGGERS (use these exact IDs):
${DEFAULT_TRIGGERS.map((t) => `- "${t.id}": ${t.name} — ${t.description}`).join("\n")}

User request: "${body.request}"

Return a JSON object with:
- "message": a brief, friendly response acknowledging the request (1-2 sentences)
- "suggestions": an array of 1-3 suggested changes, each with:
  - "type": one of "add_tool", "remove_tool", "add_mcp", "remove_mcp", "add_trigger", "remove_trigger"
  - "label": short label for the change (2-5 words)
  - "details": one sentence explaining what this does
  - "itemId": the ID of the tool/MCP/trigger to add/remove (from the lists above), or empty string for instruction changes

Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: BUILDER_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return Response.json({
        message: "I'd be happy to help modify the configuration. Could you be more specific about what you'd like to change?",
        suggestions: [],
      });
    }

    let parsed: { message?: string; suggestions?: unknown[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      return Response.json({
        message: "I'd be happy to help modify the configuration. Could you be more specific about what you'd like to change?",
        suggestions: [],
      });
    }

    const suggestionTypes = new Set<ConfigSuggestionType>([
      "add_tool",
      "remove_tool",
      "add_mcp",
      "remove_mcp",
      "add_trigger",
      "remove_trigger",
    ]);
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 3).flatMap((suggestion) => {
          if (!isRecord(suggestion) || typeof suggestion.type !== "string") return [];
          if (!suggestionTypes.has(suggestion.type as ConfigSuggestionType)) return [];

          return [{
            type: suggestion.type as ConfigSuggestionType,
            label: typeof suggestion.label === "string" ? suggestion.label : "Change",
            details: typeof suggestion.details === "string" ? suggestion.details : "",
            itemId: typeof suggestion.itemId === "string" ? suggestion.itemId : "",
          }];
        })
      : [];

    return Response.json({
      message: typeof parsed.message === "string" ? parsed.message : "Here are some suggested changes:",
      suggestions,
    });
  } catch {
    return Response.json({
      message: "I'd be happy to help, but I encountered an issue. Try rephrasing your request.",
      suggestions: [],
    });
  }
}

export async function POST(request: Request) {
  let body: GeminiRequestBody | null;

  try {
    body = parseRequestBody(await request.json());
  } catch {
    return jsonError("Invalid JSON request body.", 400);
  }

  if (!body) {
    return jsonError("Invalid Gemini request body.", 400);
  }

  try {
    switch (body.operation) {
      case "text":
        return await handleTextRequest(body);
      case "images":
        return await handleImageRequest(body);
      case "title":
        return await handleTitleRequest(body);
      case "clarify":
        return await handleClarifyRequest(body);
      case "agent-config":
        return await handleAgentConfigRequest(body);
      case "config-assist":
        return await handleConfigAssistRequest(body);
      default:
        return jsonError("Unsupported Gemini operation.", 400);
    }
  } catch (error) {
    return jsonError(getErrorMessage(error, "Gemini request failed."), 500);
  }
}
