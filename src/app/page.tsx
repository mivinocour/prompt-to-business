import { AppShell } from "@/components/app-shell";
import { DEFAULT_MODEL, getModelById } from "@/lib/chat-config";

export default function Home() {
  const envModelId = process.env.GEMINI_MODEL_PRO;
  const initialSelectedModel = (envModelId && getModelById(envModelId)) || DEFAULT_MODEL;

  return (
    <AppShell
      apiKeyConfigured={Boolean(process.env.GEMINI_API_KEY)}
      initialSelectedModel={initialSelectedModel}
    />
  );
}
