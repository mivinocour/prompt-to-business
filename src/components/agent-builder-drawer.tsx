"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  ArrowLeft,
  X,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Agent,
  AgentTemplate,
  AgentTool,
  MCPConnection,
  AgentTrigger,
  ClarifyingQuestion,
} from "@/types/agent";
import {
  AGENT_TEMPLATES,
  selectClarifyingQuestions,
  simulateAgentConfiguration,
  BUILDER_STEPS,
} from "@/lib/agent-config";
import { AgentDAGView } from "@/components/agent-dag-view";
import { AgentIcon } from "@/components/agent-icon";
import { AgentInstructionsChecklist } from "@/components/agent-instructions-checklist";

// ── Props ──

interface AgentBuilderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentCreated: (agent: Agent) => void;
  initialTemplate?: AgentTemplate;
}

// ── Step type ──

type StepId = "describe" | "clarify" | "configure" | "review";

// ── Configuration phases for Step 3 ──

interface ConfigPhase {
  id: string;
  label: string;
  items?: Array<{ name: string; icon: string }>;
}

// ── Main Component ──

export function AgentBuilderDrawer({
  open,
  onOpenChange,
  onAgentCreated,
  initialTemplate,
}: AgentBuilderDrawerProps) {
  // Step state
  const [currentStep, setCurrentStep] = useState<StepId>("describe");

  // Step 1 state
  const [description, setDescription] = useState("");

  // Step 1→2 loading state
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Step 2→4 loading state
  const pendingConfigRef = useRef<Partial<Agent> | null>(null);

  // Step 2 state
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questionDirection, setQuestionDirection] = useState(1);

  // Step 3 state
  const [configPhases, setConfigPhases] = useState<ConfigPhase[]>([]);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [phaseItemsVisible, setPhaseItemsVisible] = useState<number[]>([]);
  const [configComplete, setConfigComplete] = useState(false);

  // Step 4 state
  const [generatedAgent, setGeneratedAgent] = useState<Partial<Agent> | null>(
    null
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    tools: true,
    mcps: false,
    triggers: false,
  });

  // Apply initial template if provided
  useEffect(() => {
    if (initialTemplate && initialTemplate.id !== "custom-agent") {
      setDescription(initialTemplate.prefilledPrompt);
    }
  }, [initialTemplate]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setCurrentStep("describe");
        setDescription("");
        setIsGeneratingQuestions(false);
        setQuestionError(null);
        pendingConfigRef.current = null;
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setConfigPhases([]);
        setActivePhaseIndex(0);
        setPhaseItemsVisible([]);
        setConfigComplete(false);
        setGeneratedAgent(null);
        setExpandedSections({ tools: true, mcps: false, triggers: false });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Auto-dismiss question error banner
  useEffect(() => {
    if (questionError) {
      const timeout = setTimeout(() => setQuestionError(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [questionError]);

  // Template pills (exclude Custom Agent)
  const templatePills = useMemo(
    () => AGENT_TEMPLATES.filter((t) => t.id !== "custom-agent"),
    []
  );

  // ── Step Navigation ──

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const goToStep = useCallback((step: StepId) => {
    setCurrentStep(step);
  }, []);

  // ── Step 1: Continue (async — calls Gemini for contextual questions) ──

  const handleDescribeContinue = useCallback(async () => {
    setIsGeneratingQuestions(true);
    setQuestionError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "clarify", description }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = (await response.json()) as { questions?: ClarifyingQuestion[] };

      if (data.questions && data.questions.length >= 2) {
        setQuestions(data.questions);
      } else {
        throw new Error("Insufficient questions");
      }
    } catch {
      // Fallback to static questions
      const qs = selectClarifyingQuestions(description);
      setQuestions(qs);
      setQuestionError("Using default questions — AI generation unavailable");
    } finally {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsGeneratingQuestions(false);
      goToStep("clarify");
    }
  }, [description, goToStep]);

  // ── Step 2: Question Navigation ──

  const handleQuestionNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setQuestionDirection(1);
      setCurrentQuestionIndex((i) => i + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleQuestionPrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setQuestionDirection(-1);
      setCurrentQuestionIndex((i) => i - 1);
    }
  }, [currentQuestionIndex]);

  const handleToggleMultiSelect = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[]) ?? [];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [questionId]: next };
      });
    },
    []
  );

  const handleSelectOption = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  const handleClarifyContinue = useCallback(() => {
    // Start animation immediately with placeholder phases
    pendingConfigRef.current = null;

    const placeholderPhases: ConfigPhase[] = [
      { id: "analyze", label: "Analyzing requirements..." },
      { id: "tools", label: "Selecting tools..." },
      { id: "mcps", label: "Connecting services..." },
      { id: "instructions", label: "Generating instructions..." },
    ];

    setConfigPhases(placeholderPhases);
    setActivePhaseIndex(0);
    setPhaseItemsVisible([]);
    setConfigComplete(false);
    goToStep("configure");

    // Fire API call concurrently
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "agent-config",
        description,
        questions,
        answers,
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("API error");
        const data = (await response.json()) as { config?: Partial<Agent> };
        if (data.config) {
          pendingConfigRef.current = data.config;
        } else {
          throw new Error("No config returned");
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        // Fallback to static configuration
        pendingConfigRef.current = simulateAgentConfiguration(description, answers);
      });
  }, [description, questions, answers, goToStep]);

  const handleSkipQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setQuestionDirection(1);
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      handleClarifyContinue();
    }
  }, [currentQuestionIndex, questions.length, handleClarifyContinue]);

  // ── Step 3: Auto-Configuration Animation ──

  useEffect(() => {
    if (currentStep !== "configure") return;

    let cancelled = false;

    const waitForConfig = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (cancelled) return resolve();
          if (pendingConfigRef.current) return resolve();
          setTimeout(check, 100);
        };
        check();
      });

    const runPhases = async () => {
      // Phase 0: "Analyzing requirements..." — wait for API result during this phase
      setActivePhaseIndex(0);
      await new Promise((r) => setTimeout(r, 800));
      if (cancelled) return;

      // Wait for config to arrive (may already be ready)
      await waitForConfig();
      if (cancelled) return;

      const config = pendingConfigRef.current;

      // Update phases with real data from the API result
      if (config) {
        const updatedPhases: ConfigPhase[] = [
          { id: "analyze", label: "Analyzing requirements..." },
          {
            id: "tools",
            label: "Selecting tools...",
            items: (config.tools ?? []).map((t) => ({ name: t.name, icon: t.icon })),
          },
          {
            id: "mcps",
            label: "Connecting services...",
            items: (config.mcpConnections ?? []).map((m) => ({ name: m.name, icon: m.icon })),
          },
          { id: "instructions", label: "Generating instructions..." },
        ];
        setConfigPhases(updatedPhases);

        // Animate through remaining phases with real data
        for (let phaseIdx = 1; phaseIdx < updatedPhases.length; phaseIdx++) {
          if (cancelled) return;
          setActivePhaseIndex(phaseIdx);
          setPhaseItemsVisible([]);

          const phase = updatedPhases[phaseIdx];

          if (phase.items && phase.items.length > 0) {
            await new Promise((r) => setTimeout(r, 500));
            if (cancelled) return;

            for (let itemIdx = 0; itemIdx < phase.items.length; itemIdx++) {
              if (cancelled) return;
              setPhaseItemsVisible((prev) => [...prev, itemIdx]);
              await new Promise((r) => setTimeout(r, 300));
            }

            await new Promise((r) => setTimeout(r, 400));
          } else {
            await new Promise((r) => setTimeout(r, 900));
          }

          if (cancelled) return;
        }

        // Set generated agent from the config
        setGeneratedAgent(config);
      }

      // All phases complete
      if (!cancelled) {
        setConfigComplete(true);
        await new Promise((r) => setTimeout(r, 500));
        if (!cancelled) {
          goToStep("review");
        }
      }
    };

    runPhases();

    return () => {
      cancelled = true;
    };
  }, [currentStep, goToStep]);

  // ── Step 4: Actions ──

  const handleTestInPlayground = useCallback(() => {
    if (!generatedAgent) return;

    const now = new Date();
    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: generatedAgent.name ?? "Custom Agent",
      description: generatedAgent.description ?? description,
      avatar: generatedAgent.avatar ?? "bot",
      status: generatedAgent.status ?? "ready",
      modelId: generatedAgent.modelId ?? "gemini-3.1-pro-preview",
      systemInstruction: generatedAgent.systemInstruction ?? "",
      tools: (generatedAgent.tools as AgentTool[]) ?? [],
      mcpConnections: (generatedAgent.mcpConnections as MCPConnection[]) ?? [],
      triggers: (generatedAgent.triggers as AgentTrigger[]) ?? [],
      skills: [],
      createdAt: now,
      updatedAt: now,
      builderPrompt: description,
      clarifyingAnswers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(", ") : v,
        ])
      ),
    };

    onAgentCreated(agent);
    onOpenChange(false);
  }, [generatedAgent, description, answers, onAgentCreated, onOpenChange]);

  const handleEditConfig = useCallback(() => {
    goToStep("describe");
  }, [goToStep]);

  // ── Section toggle for Step 4 ──

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // ── Step indicator ──

  const stepIndex = BUILDER_STEPS.findIndex((s) => s.id === currentStep);

  // ── Render ──

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showClose={false}
        side="right"
        className="w-full max-w-[505px] lg:w-[505px] h-screen bg-background/95 border-l border-border backdrop-blur p-0 flex flex-col overflow-hidden"
        style={{
          maxWidth: "min(505px, 100vw)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <SheetTitle className="sr-only">Agent Builder</SheetTitle>
        <SheetDescription className="sr-only">
          Create and configure a custom AI agent.
        </SheetDescription>

        {/* ── Header ── */}
        <div
          className="w-full h-12 px-4 pt-4 flex justify-between items-center bg-background/95 backdrop-blur-md border-border flex-shrink-0"
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={currentStep === "describe" ? "Close agent builder" : "Previous step"}
              onClick={
                currentStep === "describe"
                  ? handleClose
                  : currentStep === "clarify"
                    ? () => goToStep("describe")
                    : currentStep === "review"
                      ? () => goToStep("describe")
                      : undefined
              }
              className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
              style={{
                visibility:
                  currentStep === "configure" ? "hidden" : "visible",
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className="text-foreground text-sm font-medium leading-tight"
              style={{ fontFamily: "var(--font-inter-tight), system-ui, sans-serif" }}
            >
              Build an Agent
            </div>
          </div>
          <button
            type="button"
            aria-label="Close agent builder"
            onClick={handleClose}
            className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step Progress Bar ── */}
        <div className="px-4 pt-3 pb-2 flex-shrink-0">
          <div className="flex gap-1">
            {BUILDER_STEPS.map((step, i) => (
              <div
                key={step.id}
                className="h-[2px] flex-1 rounded-full transition-all duration-500"
                style={{
                  backgroundColor:
                    i <= stepIndex
                      ? "var(--color-v3-outline-accent)"
                      : "var(--color-v3-outline-var)",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Step Content ── */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-auto-hide flex flex-col">
          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════════ */}
            {/* STEP 1: DESCRIBE                           */}
            {/* ═══════════════════════════════════════════ */}
            {currentStep === "describe" && (
              <motion.div
                key="describe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col flex-1 px-4 pb-4"
              >
                {/* Hero */}
                <div className="flex flex-col items-center pt-8 pb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor:
                        "var(--color-v3-surface-container-highest)",
                    }}
                  >
                    <Sparkles
                      className="w-5 h-5"
                      style={{ color: "var(--color-v3-text)" }}
                    />
                  </div>
                  <h2
                    className="text-center mb-1"
                    style={{
                      fontFamily: "var(--font-inter-tight), sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      lineHeight: "24px",
                      color: "var(--color-v3-text)",
                    }}
                  >
                    Tell us about the agent you want to create
                  </h2>
                  <p
                    className="text-center"
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "18px",
                      color: "var(--color-v3-text-var)",
                      maxWidth: 340,
                    }}
                  >
                    Explain what you want your agent to do and we&apos;ll guide
                    you step-by-step.
                  </p>
                </div>

                {/* Textarea */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the agent you'd like to build..."
                  className="prompt-textarea"
                  style={{
                    width: "100%",
                    minHeight: 140,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-v3-outline-var)",
                    backgroundColor: "var(--color-v3-surface-container-high)",
                    color: "var(--color-v3-text)",
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "21px",
                    resize: "vertical",
                    outline: "none",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor =
                      "var(--color-v3-outline-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--color-v3-outline-var)")
                  }
                />

                {/* Template Pills */}
                <div className="mt-4">
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "18px",
                      color: "var(--color-v3-text-var)",
                    }}
                  >
                    Or start from a template
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {templatePills.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setDescription(template.prefilledPrompt)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          height: "32px",
                          padding: "0 12px",
                          borderRadius: "12px",
                          border: "1px solid var(--color-v3-outline)",
                          backgroundColor:
                            description === template.prefilledPrompt
                              ? "var(--color-v3-button-container-high)"
                              : "var(--color-v3-surface-container)",
                          color: "var(--color-v3-text)",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          lineHeight: "20px",
                          cursor: "pointer",
                          transition:
                            "background-color 0.15s ease, border-color 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-v3-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            description === template.prefilledPrompt
                              ? "var(--color-v3-button-container-high)"
                              : "var(--color-v3-surface-container)")
                        }
                      >
                        <AgentIcon
                          name={template.icon}
                          className="w-3.5 h-3.5"
                        />
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Continue Button */}
                <div className="pt-4 pb-2">
                  <button
                    onClick={handleDescribeContinue}
                    disabled={!description.trim() || isGeneratingQuestions}
                    style={{
                      width: "100%",
                      height: "32px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-v3-outline)",
                      backgroundColor:
                        description.trim() && !isGeneratingQuestions
                          ? "var(--color-v3-button-container)"
                          : "var(--color-v3-surface-container-high)",
                      color:
                        description.trim() && !isGeneratingQuestions
                          ? "var(--color-v3-text)"
                          : "var(--color-v3-text-disable)",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      cursor:
                        description.trim() && !isGeneratingQuestions
                          ? "pointer"
                          : "not-allowed",
                      transition:
                        "background-color 0.15s ease, color 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isGeneratingQuestions && (
                      <Loader2
                        className="w-4 h-4 animate-spin"
                        style={{ color: "var(--color-v3-text-var)" }}
                      />
                    )}
                    {isGeneratingQuestions
                      ? "Generating questions..."
                      : "Continue"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* STEP 2: CLARIFY                            */}
            {/* ═══════════════════════════════════════════ */}
            {currentStep === "clarify" && questions.length > 0 && (
              <motion.div
                key="clarify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col flex-1 px-4 pb-4"
              >
                {/* Error banner (fallback notification) */}
                <AnimatePresence>
                  {questionError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        padding: "8px 12px",
                        marginTop: 8,
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: "var(--font-inter), sans-serif",
                        color: "var(--color-v3-text-var)",
                        backgroundColor: "var(--color-v3-surface-container-highest)",
                        border: "1px solid var(--color-v3-outline-var)",
                      }}
                    >
                      {questionError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Question indicator + navigation */}
                <div className="flex items-center justify-between pt-6 pb-4">
                  <span
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "18px",
                      color: "var(--color-v3-text-var)",
                    }}
                  >
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleQuestionPrev}
                      disabled={currentQuestionIndex === 0}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-v3-outline-var)",
                        backgroundColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor:
                          currentQuestionIndex === 0
                            ? "not-allowed"
                            : "pointer",
                        color:
                          currentQuestionIndex === 0
                            ? "var(--color-v3-text-disable)"
                            : "var(--color-v3-text)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleQuestionNext}
                      disabled={currentQuestionIndex === questions.length - 1}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-v3-outline-var)",
                        backgroundColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor:
                          currentQuestionIndex === questions.length - 1
                            ? "not-allowed"
                            : "pointer",
                        color:
                          currentQuestionIndex === questions.length - 1
                            ? "var(--color-v3-text-disable)"
                            : "var(--color-v3-text)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question with AnimatePresence */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <AnimatePresence mode="wait" custom={questionDirection}>
                    <motion.div
                      key={questions[currentQuestionIndex].id}
                      custom={questionDirection}
                      initial={{ opacity: 0, x: 30 * questionDirection }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 * questionDirection }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {/* Question text */}
                      <h3
                        className="mb-5"
                        style={{
                          fontFamily: "var(--font-inter-tight), sans-serif",
                          fontSize: "16px",
                          fontWeight: 600,
                          lineHeight: "24px",
                          color: "var(--color-v3-text)",
                        }}
                      >
                        {questions[currentQuestionIndex].question}
                      </h3>

                      {/* Multiselect options */}
                      {questions[currentQuestionIndex].type ===
                        "multiselect" && (
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: "repeat(2, 1fr)",
                          }}
                        >
                          {questions[currentQuestionIndex].options?.map(
                            (option) => {
                              const questionId =
                                questions[currentQuestionIndex].id;
                              const selected = (
                                (answers[questionId] as string[]) ?? []
                              ).includes(option.value);
                              return (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    handleToggleMultiSelect(
                                      questionId,
                                      option.value
                                    )
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 12px",
                                    borderRadius: "12px",
                                    border: `1px solid ${selected ? "var(--color-v3-outline-accent)" : "var(--color-v3-outline-var)"}`,
                                    backgroundColor: selected
                                      ? "var(--color-v3-surface-container-highest)"
                                      : "var(--color-v3-surface-container-high)",
                                    color: "var(--color-v3-text)",
                                    fontFamily: "var(--font-inter), sans-serif",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "20px",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    textAlign: "left",
                                  }}
                                >
                                  {/* Checkbox indicator */}
                                  <div
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "4px",
                                      border: `1.5px solid ${selected ? "var(--color-v3-outline-accent)" : "var(--color-v3-outline)"}`,
                                      backgroundColor: selected
                                        ? "var(--color-v3-outline-accent)"
                                        : "transparent",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    {selected && (
                                      <Check
                                        className="w-3 h-3"
                                        style={{ color: "#fff" }}
                                      />
                                    )}
                                  </div>
                                  {option.icon && (
                                    <AgentIcon
                                      name={option.icon}
                                      className="w-4 h-4 flex-shrink-0"
                                    />
                                  )}
                                  <span className="truncate">
                                    {option.label}
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      )}

                      {/* Text input */}
                      {questions[currentQuestionIndex].type === "text" && (
                        <div>
                          <input
                            type="text"
                            value={
                              (answers[
                                questions[currentQuestionIndex].id
                              ] as string) ?? ""
                            }
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [questions[currentQuestionIndex].id]:
                                  e.target.value,
                              }))
                            }
                            placeholder={
                              questions[currentQuestionIndex].placeholder ??
                              "Type your answer..."
                            }
                            style={{
                              width: "100%",
                              height: "40px",
                              padding: "0 12px",
                              borderRadius: "12px",
                              border:
                                "1px solid var(--color-v3-outline-var)",
                              backgroundColor:
                                "var(--color-v3-surface-container-high)",
                              color: "var(--color-v3-text)",
                              fontFamily: "var(--font-inter), sans-serif",
                              fontSize: "14px",
                              fontWeight: 400,
                              lineHeight: "20px",
                              outline: "none",
                              transition: "border-color 0.15s ease",
                            }}
                            onFocus={(e) =>
                              (e.target.style.borderColor =
                                "var(--color-v3-outline-accent)")
                            }
                            onBlur={(e) =>
                              (e.target.style.borderColor =
                                "var(--color-v3-outline-var)")
                            }
                          />
                        </div>
                      )}

                      {/* Select options (radio-style) */}
                      {questions[currentQuestionIndex].type === "select" && (
                        <div className="flex flex-col gap-2">
                          {questions[currentQuestionIndex].options?.map(
                            (option) => {
                              const questionId =
                                questions[currentQuestionIndex].id;
                              const selected =
                                answers[questionId] === option.value;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    handleSelectOption(
                                      questionId,
                                      option.value
                                    )
                                  }
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    borderRadius: "12px",
                                    border: `1px solid ${selected ? "var(--color-v3-outline-accent)" : "var(--color-v3-outline-var)"}`,
                                    backgroundColor: selected
                                      ? "var(--color-v3-surface-container-highest)"
                                      : "var(--color-v3-surface-container-high)",
                                    color: "var(--color-v3-text)",
                                    fontFamily: "var(--font-inter), sans-serif",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    lineHeight: "20px",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    textAlign: "left",
                                  }}
                                >
                                  {/* Radio indicator */}
                                  <div
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "50%",
                                      border: `1.5px solid ${selected ? "var(--color-v3-outline-accent)" : "var(--color-v3-outline)"}`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    {selected && (
                                      <div
                                        style={{
                                          width: "8px",
                                          height: "8px",
                                          borderRadius: "50%",
                                          backgroundColor:
                                            "var(--color-v3-outline-accent)",
                                        }}
                                      />
                                    )}
                                  </div>
                                  {option.icon && (
                                    <AgentIcon
                                      name={option.icon}
                                      className="w-4 h-4 flex-shrink-0"
                                    />
                                  )}
                                  <span>{option.label}</span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom buttons */}
                <div className="pt-4 pb-2 flex gap-2">
                  <button
                    onClick={handleSkipQuestion}
                    style={{
                      flex: 1,
                      height: "32px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-v3-outline-var)",
                      backgroundColor: "transparent",
                      color: "var(--color-v3-text-var)",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {questions[currentQuestionIndex]?.skipLabel ?? "Skip"}
                  </button>
                  <button
                    onClick={
                      currentQuestionIndex === questions.length - 1
                        ? handleClarifyContinue
                        : handleQuestionNext
                    }
                    style={{
                      flex: 1,
                      height: "32px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-v3-outline)",
                      backgroundColor: "var(--color-v3-button-container)",
                      color: "var(--color-v3-text)",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* STEP 3: AUTO-CONFIGURE                     */}
            {/* ═══════════════════════════════════════════ */}
            {currentStep === "configure" && (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col flex-1 px-4 pb-4"
              >
                {/* Title with shimmer */}
                <div className="flex flex-col items-center pt-10 pb-8">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor:
                        "var(--color-v3-surface-container-highest)",
                    }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles
                      className="w-6 h-6"
                      style={{ color: "var(--color-v3-text)" }}
                    />
                  </motion.div>
                  <h2
                    className="animate-shimmer"
                    style={{
                      fontFamily: "var(--font-inter-tight), sans-serif",
                      fontSize: "18px",
                      fontWeight: 600,
                      lineHeight: "24px",
                      background: `linear-gradient(
                        90deg,
                        var(--color-v3-text) 0%,
                        var(--color-v3-text-var) 50%,
                        var(--color-v3-text) 100%
                      )`,
                      backgroundSize: "400px 100%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Setting up your agent...
                  </h2>
                </div>

                {/* Phases */}
                <div className="flex flex-col gap-4">
                  {configPhases.map((phase, phaseIdx) => {
                    const isActive = phaseIdx === activePhaseIndex;
                    const isComplete = phaseIdx < activePhaseIndex || configComplete;
                    const isVisible = phaseIdx <= activePhaseIndex;

                    if (!isVisible) return null;

                    return (
                      <motion.div
                        key={phase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {/* Phase label */}
                        <div
                          className="flex items-center gap-3 mb-2"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                            lineHeight: "20px",
                            color: isComplete
                              ? "#22c55e"
                              : isActive
                                ? "var(--color-v3-text)"
                                : "var(--color-v3-text-var)",
                          }}
                        >
                          {isComplete ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 15,
                              }}
                            >
                              <Check
                                className="w-4 h-4"
                                style={{ color: "#22c55e" }}
                              />
                            </motion.div>
                          ) : isActive ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 rounded-full border-2 border-t-transparent"
                              style={{
                                borderColor:
                                  "var(--color-v3-outline-accent)",
                                borderTopColor: "transparent",
                              }}
                            />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                          <span>{phase.label}</span>
                        </div>

                        {/* Phase items (tools/MCPs) */}
                        {phase.items &&
                          phase.items.length > 0 &&
                          (isActive || isComplete) && (
                            <div className="ml-7 flex flex-col gap-1.5">
                              {phase.items.map((item, itemIdx) => {
                                const itemVisible =
                                  isComplete ||
                                  (isActive &&
                                    phaseItemsVisible.includes(itemIdx));

                                if (!itemVisible) return null;

                                return (
                                  <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.25,
                                      ease: "easeOut",
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      padding: "6px 10px",
                                      borderRadius: "8px",
                                      backgroundColor:
                                        "var(--color-v3-surface-container-high)",
                                      border:
                                        "1px solid var(--color-v3-outline-var)",
                                    }}
                                  >
                                    <AgentIcon
                                      name={item.icon}
                                      className="w-4 h-4"
                                    />
                                    <span
                                      style={{
                                        fontFamily: "var(--font-inter), sans-serif",
                                        fontSize: "13px",
                                        fontWeight: 400,
                                        lineHeight: "20px",
                                        color: "var(--color-v3-text)",
                                        flex: 1,
                                      }}
                                    >
                                      {item.name}
                                    </span>
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: 0.15,
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 20,
                                      }}
                                    >
                                      <Check
                                        className="w-3.5 h-3.5"
                                        style={{ color: "#22c55e" }}
                                      />
                                    </motion.div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* STEP 4: REVIEW                             */}
            {/* ═══════════════════════════════════════════ */}
            {currentStep === "review" && generatedAgent && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col flex-1 px-4 pb-4"
              >
                {/* Ready heading */}
                <div className="flex flex-col items-center pt-6 pb-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                      delay: 0.1,
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}
                  >
                    <Check className="w-5 h-5" style={{ color: "#22c55e" }} />
                  </motion.div>
                  <h2
                    style={{
                      fontFamily: "var(--font-inter-tight), sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                      lineHeight: "24px",
                      color: "var(--color-v3-text)",
                    }}
                  >
                    Your agent is ready
                  </h2>
                </div>

                {/* Agent Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="settings-card"
                  style={{
                    marginBottom: "12px",
                    cursor: "default",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        "var(--color-v3-surface-container-highest)",
                    }}
                  >
                    <AgentIcon
                      name={generatedAgent.avatar ?? "bot"}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="card-title" style={{ marginBottom: "4px" }}>
                      {generatedAgent.name}
                    </span>
                    <span className="card-subtitle">
                      {generatedAgent.description}
                    </span>
                  </div>
                </motion.div>

                {/* Agent Flow DAG */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  style={{ marginBottom: "12px" }}
                >
                  <AgentDAGView agent={generatedAgent} />
                </motion.div>

                {/* Agent Instructions Checklist */}
                {generatedAgent.instructionSteps && generatedAgent.instructionSteps.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                    style={{ marginBottom: "12px" }}
                  >
                    <div className="settings-card" style={{ cursor: "default" }}>
                      <AgentInstructionsChecklist steps={generatedAgent.instructionSteps} />
                    </div>
                  </motion.div>
                )}

                {/* Collapsible: Tools */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                >
                  <div
                    onClick={() => toggleSection("tools")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      padding: "8px 0",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "18px",
                        color: "var(--color-v3-text-var)",
                      }}
                    >
                      Tools ({generatedAgent.tools?.length ?? 0})
                    </span>
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200"
                      style={{
                        color: "var(--color-v3-text-var)",
                        transform: expandedSections.tools
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {expandedSections.tools && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="flex flex-col gap-1.5 pb-2">
                          {generatedAgent.tools?.map((tool) => (
                            <div
                              key={tool.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                backgroundColor:
                                  "var(--color-v3-surface-container-high)",
                                border:
                                  "1px solid var(--color-v3-outline-var)",
                              }}
                            >
                              <AgentIcon
                                name={tool.icon}
                                className="w-4 h-4"
                              />
                              <span
                                style={{
                                  fontFamily: "var(--font-inter), sans-serif",
                                  fontSize: "13px",
                                  fontWeight: 400,
                                  lineHeight: "20px",
                                  color: "var(--color-v3-text)",
                                  flex: 1,
                                }}
                              >
                                {tool.name}
                              </span>
                              <Check
                                className="w-3.5 h-3.5"
                                style={{ color: "#22c55e" }}
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <hr className="settings-divider" />

                {/* Collapsible: MCP Connections */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <div
                    onClick={() => toggleSection("mcps")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      padding: "8px 0",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "18px",
                        color: "var(--color-v3-text-var)",
                      }}
                    >
                      MCP Connections (
                      {generatedAgent.mcpConnections?.length ?? 0})
                    </span>
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200"
                      style={{
                        color: "var(--color-v3-text-var)",
                        transform: expandedSections.mcps
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {expandedSections.mcps && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="flex flex-col gap-1.5 pb-2">
                          {generatedAgent.mcpConnections?.length ? (
                            generatedAgent.mcpConnections.map((mcp) => (
                              <div
                                key={mcp.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "6px 10px",
                                  borderRadius: "8px",
                                  backgroundColor:
                                    "var(--color-v3-surface-container-high)",
                                  border:
                                    "1px solid var(--color-v3-outline-var)",
                                }}
                              >
                                <AgentIcon
                                  name={mcp.icon}
                                  className="w-4 h-4"
                                />
                                <span
                                  style={{
                                    fontFamily: "var(--font-inter), sans-serif",
                                    fontSize: "13px",
                                    fontWeight: 400,
                                    lineHeight: "20px",
                                    color: "var(--color-v3-text)",
                                    flex: 1,
                                  }}
                                >
                                  {mcp.name}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "var(--font-inter), sans-serif",
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    lineHeight: "16px",
                                    color:
                                      mcp.status === "connected"
                                        ? "#22c55e"
                                        : "var(--color-v3-text-var)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor:
                                        mcp.status === "connected"
                                          ? "#22c55e"
                                          : "var(--color-v3-text-disable)",
                                      display: "inline-block",
                                    }}
                                  />
                                  {mcp.status}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p
                              style={{
                                fontFamily: "var(--font-inter), sans-serif",
                                fontSize: "12px",
                                color: "var(--color-v3-text-var)",
                                padding: "4px 0",
                              }}
                            >
                              No MCP connections configured
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <hr className="settings-divider" />

                {/* Collapsible: Triggers */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                >
                  <div
                    onClick={() => toggleSection("triggers")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      padding: "8px 0",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: "12px",
                        fontWeight: 400,
                        lineHeight: "18px",
                        color: "var(--color-v3-text-var)",
                      }}
                    >
                      Triggers ({generatedAgent.triggers?.length ?? 0})
                    </span>
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200"
                      style={{
                        color: "var(--color-v3-text-var)",
                        transform: expandedSections.triggers
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {expandedSections.triggers && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="flex flex-col gap-1.5 pb-2">
                          {generatedAgent.triggers?.map((trigger) => (
                            <div
                              key={trigger.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                backgroundColor:
                                  "var(--color-v3-surface-container-high)",
                                border:
                                  "1px solid var(--color-v3-outline-var)",
                              }}
                            >
                              <AgentIcon
                                name={trigger.icon}
                                className="w-4 h-4"
                              />
                              <span
                                style={{
                                  fontFamily: "var(--font-inter), sans-serif",
                                  fontSize: "13px",
                                  fontWeight: 400,
                                  lineHeight: "20px",
                                  color: "var(--color-v3-text)",
                                  flex: 1,
                                }}
                              >
                                {trigger.name}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-inter), sans-serif",
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  lineHeight: "16px",
                                  color: trigger.enabled
                                    ? "#22c55e"
                                    : "var(--color-v3-text-var)",
                                }}
                              >
                                {trigger.enabled ? "Active" : "Inactive"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="pt-4 pb-2 flex gap-2"
                >
                  <button
                    onClick={handleEditConfig}
                    style={{
                      flex: 1,
                      height: "32px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-v3-outline)",
                      backgroundColor: "transparent",
                      color: "var(--color-v3-text)",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Edit Configuration
                  </button>
                  <button
                    onClick={handleTestInPlayground}
                    style={{
                      flex: 1,
                      height: "32px",
                      borderRadius: "12px",
                      border: "1px solid var(--color-v3-outline)",
                      backgroundColor: "var(--color-v3-button-container)",
                      color: "var(--color-v3-text)",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      lineHeight: "20px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Test in Playground
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
