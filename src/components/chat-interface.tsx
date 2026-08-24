"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MsIcon } from "@/components/ui/ms-icon";
import { AIS_AGENT_SUGGESTIONS } from "@/lib/agent-config";
import { getAgentMaterialIcon } from "@/components/agent-icon";
import { useToast } from "@/hooks/use-toast";
import { useChatSession } from "@/hooks/useChatSession";
import { DEFAULT_IMAGE_SETTINGS, DEFAULT_MODEL, DEFAULT_RUN_SETTINGS } from "@/lib/chat-config";
import { cn } from "@/lib/utils";
import { ChatInterfaceProps, Model } from "@/types/chat";
import { ChatHeader } from "@/components/chat-header";
import { PlaygroundHeader } from "@/components/playground-header";
import { FormattedMessage } from "@/components/chat/FormattedMessage";
import { AgentMessageBlocks } from "@/components/chat/AgentMessageBlocks";
import { ImageGallery } from "@/components/chat/ImageGallery";
import { ConfigSuggestionList } from "@/components/chat/ConfigSuggestionList";
import { ModelBrowser } from "@/components/model-browser";
import { ChatInput, ChatInputRef } from "@/components/ui/chat-input";

// Turn author label — matches live AI Studio: "User • 11:07 AM" (12px #8c8c8c, time 11px)
function TurnLabel({
  author,
  timestamp,
  suffix,
}: {
  author: string;
  timestamp?: Date;
  suffix?: string;
}) {
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;
  return (
    <div
      className="flex items-center"
      style={{
        color: "var(--color-v3-text-var)",
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "18px",
        gap: "8px",
      }}
    >
      <span>{author}</span>
      {time && (
        <>
          <span style={{ fontSize: "8px" }}>•</span>
          <span style={{ fontSize: "11px" }}>{time}</span>
        </>
      )}
      {suffix && (
        <>
          <span style={{ fontSize: "8px" }}>•</span>
          <span style={{ fontSize: "11px" }}>{suffix}</span>
        </>
      )}
    </div>
  );
}

export function ChatInterface({
  className,
  selectedModel,
  selectedAgent,
  imageSettings,
  runSettings,
  apiKeyConfigured,
  onModelChange,
  onAgentSelect,
  onAgentChange,
  browserTab,
  onBrowserTabChange,
  onBackToHome,
  ...props
}: ChatInterfaceProps) {
  const { toast } = useToast();
  const chatInputRef = useRef<ChatInputRef>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentModel = selectedModel ?? DEFAULT_MODEL;
  const currentImageSettings = imageSettings ?? DEFAULT_IMAGE_SETTINGS;
  const currentRunSettings = runSettings ?? DEFAULT_RUN_SETTINGS;
  const {
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
  } = useChatSession({
    selectedModel: currentModel,
    selectedAgent: selectedAgent ?? null,
    imageSettings: currentImageSettings,
    runSettings: currentRunSettings,
    onAgentChange,
  });

  // Auto-scroll to bottom when messages change (new messages or streaming content)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleModelSelection = (model: Model) => {
    onModelChange?.(model);

    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);

    toast({
      description: `Selected ${model.name} - Ready to chat!`,
      duration: 3000,
    });
  };

  const handleBack = () => {
    resetConversation();
    onBackToHome?.();
  };

  return (
    <div className={cn("flex flex-1 flex-col h-screen bg-background", className)} {...props}>
      {!isInChat && !selectedAgent && (
        <>
        <PlaygroundHeader />
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-6">
          <div className="flex w-full max-w-[1000px] flex-col items-center">
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <ModelBrowser
                onModelSelect={handleModelSelection}
                onAgentSelect={onAgentSelect}
                activeTab={browserTab}
                onTabChange={onBrowserTabChange}
              />
            </motion.div>
          </div>
        </div>
        </>
      )}

      {/* Agent session (pre-chat) — matches live AI Studio zero-state:
          Back to agents + centered agent card with suggestion chips */}
      {!isInChat && selectedAgent && (
        <>
          <PlaygroundHeader title="Untitled prompt" editable />
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-6">
            <div className="agent-zero-state">
              <button className="back-to-agents-btn" onClick={() => onBackToHome?.()}>
                <MsIcon name="arrow_back" />
                Back to agents
              </button>
              <div className="agent-card">
                <div className="agent-card-icon">
                  <MsIcon name={getAgentMaterialIcon(selectedAgent.avatar)} size={32} />
                </div>
                <h2 className="agent-card-title">{selectedAgent.name}</h2>
                <p className="agent-card-description">{selectedAgent.description}</p>
                <div className="agent-chip-row">
                  {(AIS_AGENT_SUGGESTIONS[selectedAgent.id] ?? []).map((s) => (
                    <button
                      key={s.label}
                      className="filter-chip"
                      onClick={() => {
                        setUserInput(s.prompt);
                        chatInputRef.current?.focus();
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {isInChat && (
        <div className="flex-1 overflow-y-auto scrollbar-auto-hide">
          <ChatHeader
            chatName={chatName}
            usage={usage}
            currentModelName={selectedAgent ? selectedAgent.name : currentModel.name}
            onReset={resetConversation}
            onBack={handleBack}
          />
          <div className="mx-auto max-w-[936px] space-y-8 px-4 sm:px-6 py-6">
            {messages.map((message, index) => (
              <div key={message.id}>
                {message.role === "user" ? (
                  <motion.div
                    className="flex w-full flex-col gap-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <TurnLabel author="User" timestamp={message.timestamp} />
                    <div
                      style={{
                        fontFamily: "var(--font-inter), system-ui, sans-serif",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "21px",
                        color: "rgb(226, 226, 229)",
                      }}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <TurnLabel
                      author={message.agentName ?? "Model"}
                      timestamp={message.timestamp}
                      suffix={
                        message.isStreaming
                          ? `Running for ${currentStreamingTime}s`
                          : undefined
                      }
                    />
                    {message.agentBlocks && message.agentBlocks.length > 0 && (
                      <div className="mt-1">
                        <AgentMessageBlocks blocks={message.agentBlocks} />
                      </div>
                    )}
                    {(message.content.trim().length > 0 || message.isStreaming) && (
                      <div className={message.agentBlocks && message.agentBlocks.length > 0 ? "mt-3" : ""}>
                        <FormattedMessage content={message.content} isStreaming={message.isStreaming} />
                      </div>
                    )}
                    {/* Config suggestion cards */}
                    {message.configSuggestions && message.configSuggestions.length > 0 && (
                      <ConfigSuggestionList
                        suggestions={message.configSuggestions}
                        onAccept={(index) => handleAcceptSuggestion(message.id, index)}
                        onDismiss={(index) => handleDismissSuggestion(message.id, index)}
                      />
                    )}
                    {message.images && message.images.length > 0 && (
                      <ImageGallery images={message.images} />
                    )}
                  </motion.div>
                )}

                {message.role === "model" && index < messages.length - 1 && (
                  <div className="mt-12 border-t border-border" />
                )}
              </div>
            ))}
            {/* Hallucinations disclaimer — matches live AI Studio */}
            {!isLoading && messages.length > 0 && (
              <div
                className="flex items-center"
                style={{
                  gap: "8px",
                  color: "rgb(168, 171, 180)",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "11px",
                  fontWeight: 400,
                  lineHeight: "20px",
                }}
              >
                <MsIcon name="info" size={14} className="flex-shrink-0" />
                Google AI models may make mistakes, so double-check outputs.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <ChatInput
        value={userInput}
        onChange={setUserInput}
        onSubmit={handleRun}
        placeholder="Start typing a prompt to see what our models can do"
        agentMode={!!selectedAgent || browserTab === "agents"}
        isLoading={isLoading}
        apiKeyConfigured={apiKeyConfigured}
        submitLabel="Run"
        className="bg-background"
        ref={chatInputRef}
      />
    </div>
  );
}
