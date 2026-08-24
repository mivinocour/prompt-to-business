import { GoogleGenAI } from "@google/genai";
import { getInvocationAgentId } from "@/lib/managed-agent-templates";
import { ensureManagedAgent, errorMessage, getGeminiClient } from "@/lib/managed-agents-server";

// Managed agent interactions via the Gemini API
// (https://ai.google.dev/gemini-api/docs/managed-agents-quickstart).
// Streams NDJSON lines of raw interaction SSE events to the client.

export const runtime = "nodejs";
export const maxDuration = 300;

type AgentRequestBody = {
  prompt: string;
  agentTemplateId: string;
  systemInstruction?: string;
  previousInteractionId?: string;
  environmentId?: string;
};

const parseRequestBody = (value: unknown): AgentRequestBody | null => {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  if (
    typeof record.prompt !== "string" ||
    !record.prompt.trim() ||
    typeof record.agentTemplateId !== "string" ||
    !getInvocationAgentId(record.agentTemplateId)
  ) {
    return null;
  }

  const optionalString = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string) : undefined;

  return {
    prompt: record.prompt.trim(),
    agentTemplateId: record.agentTemplateId,
    systemInstruction: optionalString("systemInstruction"),
    previousInteractionId: optionalString("previousInteractionId"),
    environmentId: optionalString("environmentId"),
  };
};

export async function POST(request: Request) {
  let body: AgentRequestBody | null;
  try {
    body = parseRequestBody(await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body) {
    return Response.json({ error: "Missing prompt or invalid agent template" }, { status: 400 });
  }

  let client: GoogleGenAI;
  try {
    client = getGeminiClient();
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }

  try {
    const isBaseAgent = body.agentTemplateId === "antigravity-preview";
    const invocationAgentId = isBaseAgent
      ? getInvocationAgentId(body.agentTemplateId)!
      : await ensureManagedAgent(client, body.agentTemplateId);

    const stream = await client.interactions.create(
      {
        agent: invocationAgentId,
        input: body.prompt,
        ...(isBaseAgent && body.systemInstruction
          ? { system_instruction: body.systemInstruction }
          : {}),
        ...(body.previousInteractionId
          ? { previous_interaction_id: body.previousInteractionId }
          : {}),
        environment: body.environmentId ?? "remote",
        stream: true,
      },
      { timeout: 300_000 }
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "error", error: { message: errorMessage(error) } }) + "\n"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Agent interaction error:", error);
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
