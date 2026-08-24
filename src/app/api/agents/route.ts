import { MANAGED_AGENT_TEMPLATES } from "@/lib/managed-agent-templates";
import {
  errorMessage,
  getGeminiClient,
  provisionManagedAgentTemplates,
} from "@/lib/managed-agents-server";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET() {
  try {
    const client = getGeminiClient();
    const response = await client.agents.list();
    const availableIds = new Set((response.agents ?? []).map((agent) => agent.id));

    return Response.json({
      agents: MANAGED_AGENT_TEMPLATES.map((template) => ({
        uiAgentId: template.uiAgentId,
        managedAgentId: template.managedAgentId,
        ready: availableIds.has(template.managedAgentId),
      })),
    });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const agents = await provisionManagedAgentTemplates(getGeminiClient());
    return Response.json({ agents });
  } catch (error) {
    console.error("Managed agent provisioning error:", error);
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
