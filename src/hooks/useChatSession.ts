"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_RUN_SETTINGS, isImageGenerationModel, isSupportedRunModel } from "@/lib/chat-config";
import { buildAgentSystemPrompt } from "@/lib/agent-config";
import {
  applyConfigSuggestion,
  isAgentConfigRequest,
  normalizeConfigSuggestions,
} from "@/lib/agent-config-actions";
import { createManagedAgentEventHandler, ManagedAgentSession } from "@/lib/managed-agent-events";
import { ImageSettings, Message, Model, RunSettings, UsageMetrics } from "@/types/chat";
import { Agent } from "@/types/agent";
import { calculateDetailedCost, calculateTokens } from "@/utils/pricing";

const EMPTY_USAGE: UsageMetrics = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  inputCost: 0,
  outputCost: 0,
  totalCost: 0,
};

const DEFAULT_CHAT_NAME = "New Chat";

interface UseChatSessionOptions {
  selectedModel: Model;
  selectedAgent?: Agent | null;
  imageSettings: ImageSettings;
  runSettings?: RunSettings;
  onAgentChange?: (agent: Agent) => void;
}

const getHistory = (messages: Message[]) =>
  messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

const getErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    return typeof data.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
};

export function useChatSession({
  selectedModel,
  selectedAgent,
  imageSettings,
  runSettings = DEFAULT_RUN_SETTINGS,
  onAgentChange,
}: UseChatSessionOptions) {
  const { toast } = useToast();
  // Managed-agent session state (Gemini interactions API): conversation + sandbox continuity
  const managedSessionRef = useRef<ManagedAgentSession>({});

  const [chatName, setChatName] = useState(DEFAULT_CHAT_NAME);
  const [currentStreamingTime, setCurrentStreamingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingStartTime, setStreamingStartTime] = useState<number | null>(null);
  const [usage, setUsage] = useState<UsageMetrics>(EMPTY_USAGE);
  const [userInput, setUserInput] = useState("");

  const isInChat = messages.length > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (streamingStartTime && isLoading) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - streamingStartTime) / 1000;
        setCurrentStreamingTime(Math.floor(elapsed));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [streamingStartTime, isLoading]);

  const updateMessage = (messageId: string, updater: (message: Message) => Message) => {
    setMessages((previousMessages) =>
      previousMessages.map((message) => (message.id === messageId ? updater(message) : message))
    );
  };

  const resetConversation = () => {
    setChatName(DEFAULT_CHAT_NAME);
    setCurrentStreamingTime(0);
    setMessages([]);
    setStreamingStartTime(null);
    setUsage(EMPTY_USAGE);
    setUserInput("");
    managedSessionRef.current = {};
  };

  const createModelMessage = () => ({
    id: `${Date.now()}-model`,
    role: "model" as const,
    content: "",
    timestamp: new Date(),
    model: selectedModel.name,
    executionTime: 0,
    isStreaming: true,
  });

  const generateChatName = async (userPrompt: string, assistantResponse: string) => {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "title",
          assistantResponse,
          userPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Failed to generate a chat title."));
      }

      const data = (await response.json()) as { title?: string };
      setChatName(data.title || DEFAULT_CHAT_NAME);
    } catch (error) {
      console.error("Error generating chat name:", error);
      setChatName("Chat Session");
    }
  };

  const handleImageGeneration = async (
    prompt: string,
    history: ReturnType<typeof getHistory>,
    messageId: string,
    isFirstConversation: boolean,
    startedAt: number
  ) => {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "images",
        history,
        imageSettings,
        modelId: selectedModel.id,
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Failed to generate images."));
    }

    const data = (await response.json()) as {
      images?: Array<{
        imageBytes: string;
        mimeType?: string;
      }>;
      text?: string;
    };
    const generatedImages = data.images ?? [];
    const executionTime = (Date.now() - startedAt) / 1000;
    const inputTokenCount = calculateTokens(prompt);
    const nextUsage = calculateDetailedCost(inputTokenCount, 0, selectedModel.id, generatedImages.length);

    setUsage(nextUsage);
    updateMessage(messageId, (message) => ({
      ...message,
      content: data.text || `Generated ${generatedImages.length} images`,
      executionTime,
      images: generatedImages,
      isStreaming: false,
    }));

    if (isFirstConversation) {
      await generateChatName(prompt, data.text || `Generated ${generatedImages.length} images`);
    }

    toast({
      description: `Generated ${generatedImages.length} images successfully!`,
      duration: 3000,
    });
  };

  const handleTextGeneration = async (
    prompt: string,
    history: ReturnType<typeof getHistory>,
    messageId: string,
    isFirstConversation: boolean,
    startedAt: number
  ) => {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "text",
        history,
        modelId: selectedModel.id,
        prompt,
        runSettings,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(await getErrorMessage(response, "Failed to generate a response."));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      fullContent += decoder.decode(value, { stream: true });

      updateMessage(messageId, (message) => ({
        ...message,
        content: fullContent,
      }));
    }

    fullContent += decoder.decode();

    const executionTime = (Date.now() - startedAt) / 1000;
    const inputTokenCount = calculateTokens(prompt);
    const outputTokenCount = calculateTokens(fullContent);
    const nextUsage = calculateDetailedCost(inputTokenCount, outputTokenCount, selectedModel.id);

    setUsage(nextUsage);
    updateMessage(messageId, (message) => ({
      ...message,
      content: fullContent,
      executionTime,
      isStreaming: false,
    }));

    if (isFirstConversation) {
      await generateChatName(prompt, fullContent);
    }

    toast({
      description: "Response generated successfully!",
      duration: 3000,
    });
  };

  // ── Agent chat (real Gemini streaming with visual blocks) ──
  // ── Managed agent chat via the Gemini interactions API (antigravity) ──
  // Streams real step events (thoughts, code execution, search, url context)
  // into agent blocks. Falls back to the simulated path if the API errors
  // (e.g. free-tier key — managed agents require a paid API key).
  const handleManagedAgentChat = async (
    prompt: string,
    messageId: string,
    agent: Agent,
    isFirstConversation: boolean,
    startedAt: number
  ): Promise<void> => {
    const session = managedSessionRef.current;
    if (session.agentTemplateId !== agent.id) {
      session.agentTemplateId = agent.id;
      session.interactionId = undefined;
      session.environmentId = undefined;
    }

    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        agentTemplateId: agent.id,
        systemInstruction: buildAgentSystemPrompt(agent),
        previousInteractionId: session.interactionId,
        environmentId: session.environmentId,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(await getErrorMessage(response, "Managed agent request failed."));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffered = "";
    const eventHandler = createManagedAgentEventHandler({
      messageId,
      session,
      callbacks: {
        onBlockAdded: (block) => {
          updateMessage(messageId, (message) => ({
            ...message,
            agentBlocks: [...(message.agentBlocks ?? []), block],
          }));
        },
        onBlockCompleted: (blockId) => {
          updateMessage(messageId, (message) => ({
            ...message,
            agentBlocks: (message.agentBlocks ?? []).map((block) =>
              block.id === blockId
                ? { ...block, status: "completed", defaultCollapsed: true }
                : block
            ),
          }));
        },
        onBlockContent: (blockId, content) => {
          if (!content) return;
          updateMessage(messageId, (message) => ({
            ...message,
            agentBlocks: (message.agentBlocks ?? []).map((block) =>
              block.id === blockId
                ? { ...block, content: (block.content + content).slice(-4000) }
                : block
            ),
          }));
        },
        onContent: (content) => {
          updateMessage(messageId, (message) => ({ ...message, content }));
        },
      },
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffered += decoder.decode(value, { stream: true });
      const lines = buffered.split("\n");
      buffered = lines.pop() ?? "";
      for (const line of lines) {
        eventHandler.handleLine(line);
      }
    }
    eventHandler.handleLine(buffered);

    const finalContent = eventHandler.getFinalContent();
    if (!finalContent) {
      throw new Error("Managed agent returned no output.");
    }

    const executionTime = (Date.now() - startedAt) / 1000;
    const inputTokenCount = calculateTokens(prompt);
    const outputTokenCount = calculateTokens(finalContent);
    setUsage(calculateDetailedCost(inputTokenCount, outputTokenCount, agent.modelId));

    updateMessage(messageId, (msg) => ({
      ...msg,
      content: finalContent,
      executionTime,
      isStreaming: false,
      agentBlocks: (msg.agentBlocks || []).map((b) =>
        b.status === "running" ? { ...b, status: "completed" as const, defaultCollapsed: true } : b
      ),
    }));

    if (isFirstConversation) {
      await generateChatName(prompt, finalContent);
    }

    toast({ description: `${agent.name} completed the task`, duration: 3000 });
  };

  // ── Config-assist handler for inline suggestion cards ──
  const handleConfigAssist = async (
    prompt: string,
    messageId: string,
    agent: Agent,
    isFirstConversation: boolean,
    startedAt: number
  ) => {
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "config-assist",
          agent: {
            name: agent.name,
            tools: agent.tools.filter((t) => t.enabled),
            mcpConnections: agent.mcpConnections.filter((m) => m.status === "connected"),
            triggers: agent.triggers.filter((t) => t.enabled),
          },
          request: prompt,
        }),
      });
      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Failed to update the agent configuration."));
      }

      const data = (await res.json()) as { message?: unknown; suggestions?: unknown };
      const executionTime = (Date.now() - startedAt) / 1000;
      const suggestions = normalizeConfigSuggestions(data.suggestions);

      updateMessage(messageId, (msg) => ({
        ...msg,
        content:
          typeof data.message === "string"
            ? data.message
            : "Here are some suggested changes:",
        configSuggestions: suggestions,
        executionTime,
        isStreaming: false,
      }));

      if (isFirstConversation) {
        setChatName(`Chat with ${agent.name}`);
      }
    } catch {
      const executionTime = (Date.now() - startedAt) / 1000;
      updateMessage(messageId, (msg) => ({
        ...msg,
        content: "Sorry, I couldn't process that config request. Try rephrasing.",
        executionTime,
        isStreaming: false,
      }));
    } finally {
      setIsLoading(false);
      setStreamingStartTime(null);
      setCurrentStreamingTime(0);
    }
  };

  // ── Accept/dismiss config suggestions ──
  const handleAcceptSuggestion = (messageId: string, sugIdx: number) => {
    if (!selectedAgent) return;

    const msg = messages.find((m) => m.id === messageId);
    const suggestion = msg?.configSuggestions?.[sugIdx];
    if (!suggestion || suggestion.status !== "pending") return;

    onAgentChange?.(applyConfigSuggestion(selectedAgent, suggestion));

    // Mark suggestion as applied
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.configSuggestions
          ? {
              ...m,
              configSuggestions: m.configSuggestions.map((s, si) =>
                si === sugIdx ? { ...s, status: "applied" as const } : s
              ),
            }
          : m
      )
    );
  };

  const handleDismissSuggestion = (messageId: string, sugIdx: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.configSuggestions
          ? {
              ...m,
              configSuggestions: m.configSuggestions.map((s, si) =>
                si === sugIdx ? { ...s, status: "dismissed" as const } : s
              ),
            }
          : m
      )
    );
  };

  const handleRun = async () => {
    const prompt = userInput.trim();

    if (!prompt || isLoading) {
      return;
    }

    const previousMessages = messages;
    const isFirstConversation = previousMessages.length === 0;
    const startedAt = Date.now();

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    // ── Agent mode ──
    if (selectedAgent) {
      // Detect config requests and route to config-assist
      if (isAgentConfigRequest(prompt)) {
        const configMessage: Message = {
          id: `${Date.now()}-model`,
          role: "model",
          content: "",
          timestamp: new Date(),
          model: selectedAgent.modelId,
          agentName: selectedAgent.name,
          executionTime: 0,
          isStreaming: true,
        };

        setUserInput("");
        setIsLoading(true);
        setStreamingStartTime(startedAt);
        setCurrentStreamingTime(0);
        setMessages((currentMessages) => [...currentMessages, userMessage, configMessage]);

        handleConfigAssist(prompt, configMessage.id, selectedAgent, isFirstConversation, startedAt);
        return;
      }

      // Regular agent chat with visual blocks
      const agentMessage: Message = {
        id: `${Date.now()}-model`,
        role: "model",
        content: "",
        timestamp: new Date(),
        model: selectedAgent.modelId,
        agentName: selectedAgent.name,
        agentBlocks: [],
        executionTime: 0,
        isStreaming: true,
      };

      setUserInput("");
      setIsLoading(true);
      setStreamingStartTime(startedAt);
      setCurrentStreamingTime(0);
      setMessages((currentMessages) => [...currentMessages, userMessage, agentMessage]);

      // Every agent card is backed by a real Gemini managed-agent interaction.
      handleManagedAgentChat(prompt, agentMessage.id, selectedAgent, isFirstConversation, startedAt)
        .then(() => {
          setIsLoading(false);
          setStreamingStartTime(null);
          setCurrentStreamingTime(0);
        })
        .catch((error) => {
          console.error("Managed agent interaction failed:", error);
          const message =
            error instanceof Error ? error.message : "The managed agent request failed.";
          updateMessage(agentMessage.id, (currentMessage) => ({
            ...currentMessage,
            content: `Managed agent error: ${message}`,
            executionTime: (Date.now() - startedAt) / 1000,
            isStreaming: false,
            agentBlocks: (currentMessage.agentBlocks ?? []).map((block) =>
              block.status === "running" ? { ...block, status: "failed" as const } : block
            ),
          }));
          setIsLoading(false);
          setStreamingStartTime(null);
          setCurrentStreamingTime(0);
          toast({
            variant: "destructive",
            description: `${selectedAgent.name} could not complete the task.`,
          });
        });
      return;
    }

    // ── Model mode: real API calls ──
    if (!isSupportedRunModel(selectedModel.id)) {
      toast({
        variant: "destructive",
        description: "This prototype currently supports text and image generation models only.",
      });
      return;
    }

    const history = getHistory(previousMessages);
    const modelMessage = createModelMessage();

    setUserInput("");
    setIsLoading(true);
    setStreamingStartTime(startedAt);
    setCurrentStreamingTime(0);
    setMessages((currentMessages) => [...currentMessages, userMessage, modelMessage]);

    try {
      if (isImageGenerationModel(selectedModel.id)) {
        await handleImageGeneration(prompt, history, modelMessage.id, isFirstConversation, startedAt);
      } else {
        await handleTextGeneration(prompt, history, modelMessage.id, isFirstConversation, startedAt);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      updateMessage(modelMessage.id, (message) => ({
        ...message,
        content: error instanceof Error ? error.message : "Something went wrong while generating a response.",
        isStreaming: false,
      }));
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to generate response. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setStreamingStartTime(null);
      setCurrentStreamingTime(0);
    }
  };

  return {
    chatName,
    currentStreamingTime,
    handleAcceptSuggestion,
    handleDismissSuggestion,
    handleRun,
    isInChat,
    isLoading,
    messages,
    resetConversation,
    setUserInput,
    usage,
    userInput,
  };
}
