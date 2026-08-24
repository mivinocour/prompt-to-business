import { GoogleGenAI } from "@google/genai";
import {
  createManagedAgentPayload,
  getManagedAgentTemplate,
  MANAGED_AGENT_TEMPLATES,
  ManagedAgentTemplate,
} from "@/lib/managed-agent-templates";

const provisioningRequests = new Map<string, Promise<string>>();

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY on the server.");
  return new GoogleGenAI({ apiKey });
};

const errorMessage = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "Managed agent request failed.";

const isNotFound = (error: unknown) => /(?:404|not[_ ]found|not found)/i.test(errorMessage(error));
const isAlreadyExists = (error: unknown) =>
  /(?:409|already[_ ]exists|already exists)/i.test(errorMessage(error));

const createAgent = async (client: GoogleGenAI, template: ManagedAgentTemplate) => {
  try {
    const existing = await client.agents.get(template.managedAgentId);
    return existing.id ?? template.managedAgentId;
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  try {
    const created = await client.agents.create(createManagedAgentPayload(template), {
      timeout: 300_000,
    });
    return created.id ?? template.managedAgentId;
  } catch (error) {
    if (!isAlreadyExists(error)) throw error;
    const existing = await client.agents.get(template.managedAgentId);
    return existing.id ?? template.managedAgentId;
  }
};

export const ensureManagedAgent = async (client: GoogleGenAI, uiAgentId: string) => {
  const template = getManagedAgentTemplate(uiAgentId);
  if (!template) throw new Error(`Unknown managed agent template: ${uiAgentId}`);

  const pending = provisioningRequests.get(template.managedAgentId);
  if (pending) return pending;

  const request = createAgent(client, template).finally(() => {
    provisioningRequests.delete(template.managedAgentId);
  });
  provisioningRequests.set(template.managedAgentId, request);
  return request;
};

export const provisionManagedAgentTemplates = async (client: GoogleGenAI) =>
  Promise.all(
    MANAGED_AGENT_TEMPLATES.map(async (template) => ({
      uiAgentId: template.uiAgentId,
      managedAgentId: await ensureManagedAgent(client, template.uiAgentId),
    }))
  );

export { errorMessage };
