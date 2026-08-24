"use client";

import { cn } from "@/lib/utils";
import {
  X,
  ArrowLeft,
  Check,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_MODEL,
  DEFAULT_RUN_SETTINGS,
  getModelsForFilter,
  getTemplateNameForInstruction,
  MODEL_FILTERS,
  type ModelFilter,
  SYSTEM_INSTRUCTION_TEMPLATES,
} from "@/lib/chat-config";
import { Model, RunSettings } from "@/types/chat";
import { MsIcon } from "@/components/ui/ms-icon";
import { SettingsToggle } from "@/components/ui/settings-toggle";
import type { Agent } from "@/types/agent";

interface ModelConfigPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedModel?: Model;
  onModelChange?: (model: Model) => void;
  runSettings?: RunSettings;
  onRunSettingsChange?: (settings: RunSettings) => void;
  apiKeyConfigured?: boolean;
  onMobileClose?: () => void;
  selectedAgent?: Agent;
  onAgentChange?: (agent: Agent) => void;
  onEditAgent?: () => void;
}

export function ModelConfigPanel({
  className,
  selectedModel,
  onModelChange,
  runSettings,
  onRunSettingsChange,
  apiKeyConfigured = false,
  onMobileClose,
  selectedAgent,
  onAgentChange,
  onEditAgent,
  ...props
}: ModelConfigPanelProps) {
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [showSystemInstructions, setShowSystemInstructions] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ModelFilter>("All");
  const [modelSearch, setModelSearch] = useState("");
  const [copiedModel, setCopiedModel] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("Default");

  // AI Studio-style settings state
  const [thinkingLevel, setThinkingLevel] = useState("High");
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [structuredOutputs, setStructuredOutputs] = useState(false);
  const [codeExecution, setCodeExecution] = useState(false);
  const [functionCalling, setFunctionCalling] = useState(false);
  const [groundingSearch, setGroundingSearch] = useState(false);
  const [groundingMaps, setGroundingMaps] = useState(false);
  const [urlContext, setUrlContext] = useState(false);

  // Agent run settings state — matches live AI Studio agent mode defaults
  const [agentToolsExpanded, setAgentToolsExpanded] = useState(true);
  const [agentEnvExpanded, setAgentEnvExpanded] = useState(true);
  const [agentCodeExecution, setAgentCodeExecution] = useState(true);
  const [agentGroundingSearch, setAgentGroundingSearch] = useState(true);
  const [agentUrlContext, setAgentUrlContext] = useState(true);
  const [agentFilesystemTools, setAgentFilesystemTools] = useState(false);
  const [agentEnvType, setAgentEnvType] = useState<"New" | "Existing">("New");

  const currentRunSettings = runSettings ?? DEFAULT_RUN_SETTINGS;
  const currentSelectedModel = selectedModel ?? DEFAULT_MODEL;
  const normalizedSearch = modelSearch.trim().toLowerCase();
  const filteredModels = getModelsForFilter(activeFilter).filter(
    (model) =>
      !normalizedSearch ||
      model.name.toLowerCase().includes(normalizedSearch) ||
      model.id.toLowerCase().includes(normalizedSearch) ||
      model.description.toLowerCase().includes(normalizedSearch)
  );
  const filterTabs = MODEL_FILTERS;
  const { toast } = useToast();

  useEffect(() => {
    setSelectedTemplate(getTemplateNameForInstruction(currentRunSettings.systemInstruction));
  }, [currentRunSettings.systemInstruction]);

  const updateRunSettings = (newSettings: Partial<RunSettings>) => {
    onRunSettingsChange?.({ ...currentRunSettings, ...newSettings });
  };

  const handleCopyModel = async (modelId: string) => {
    try {
      await navigator.clipboard.writeText(modelId);
      setCopiedModel(modelId);
      toast({ description: `Copied ${modelId} to clipboard`, duration: 2000 });
      setTimeout(() => setCopiedModel(null), 2000);
    } catch (err) {
      toast({ variant: "destructive", description: "Failed to copy to clipboard", duration: 2000 });
    }
  };

  const handleModelSelect = (model: Model) => {
    onModelChange?.(model);
    setShowModelSelection(false);
    toast({ description: `Selected ${model.name}`, duration: 2000 });
  };

  const handleSystemInstructionSave = () => {
    setShowSystemInstructions(false);
    toast({ description: `System instructions updated`, duration: 2000 });
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    updateRunSettings({
      systemInstruction: SYSTEM_INSTRUCTION_TEMPLATES[template] ?? DEFAULT_RUN_SETTINGS.systemInstruction,
    });
  };

  return (
    <div className={cn("w-full max-w-[300px] lg:w-[300px] h-screen bg-background flex flex-col overflow-hidden", className)} {...props}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header — matches live AI Studio: title + Get code + headphones + close */}
        <div className="w-full flex justify-between items-center flex-shrink-0" style={{ height: '56px', padding: '16px 16px 8px' }}>
          <div
            style={{
              color: 'rgb(198, 198, 201)',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
            }}
          >
            Run settings
          </div>
          <div className="flex items-center gap-1">
            <button
              className="flex items-center hover:bg-[var(--color-v3-hover)] transition-colors"
              style={{
                gap: '4px',
                height: '28px',
                padding: '0 12px',
                borderRadius: '12px',
                border: '1px solid transparent',
                background: 'transparent',
                color: 'var(--color-v3-text)',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '18px',
                cursor: 'pointer',
              }}
            >
              <MsIcon name="code" size={14} />
              Get code
            </button>
            <Button variant="ghost" size="sm" className="w-7 h-7 p-0 rounded-full text-muted-foreground hover:text-foreground">
              <span className="sr-only">Reset settings</span>
              <MsIcon name="reset_settings" size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="w-7 h-7 p-0 rounded-full text-muted-foreground hover:text-foreground lg:hidden" onClick={onMobileClose}>
              <span className="sr-only">Close run settings</span>
              <MsIcon name="close" size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="w-7 h-7 p-0 rounded-full text-muted-foreground hover:text-foreground hidden lg:flex items-center justify-center">
              <span className="sr-only">Collapse run settings</span>
              <MsIcon name="close" size={16} />
            </Button>
          </div>
        </div>

        {/* Scrollable Content Area - AI Studio style */}
        <div className="settings-scrollable extracted">
          {selectedAgent ? (
            <>
              {/* ══════════════════════════════════════════ */}
              {/*  AGENT RUN SETTINGS — matches live AI Studio agent mode  */}
              {/* ══════════════════════════════════════════ */}

              {/* === Agent Model Card === */}
              <button className="settings-card" style={{ marginBottom: 8 }} onClick={() => onEditAgent?.()}>
                <span className="card-title">
                  {selectedAgent.id === "antigravity-preview"
                    ? "Antigravity Agent Preview"
                    : selectedAgent.name}
                </span>
                <span className="card-subtitle" style={{ display: "block", marginBottom: 2 }}>
                  {selectedAgent.managedAgentId ?? selectedAgent.id}
                </span>
                <span className="card-subtitle">{selectedAgent.description}</span>
              </button>

              {/* === System Instructions Card === */}
              <button className="settings-card" style={{ marginBottom: 8 }} onClick={() => onEditAgent?.()}>
                <span className="card-title">System instructions</span>
                <span className="card-subtitle">
                  {selectedAgent.systemInstruction.length > 100
                    ? `${selectedAgent.systemInstruction.substring(0, 100)}...`
                    : selectedAgent.systemInstruction || "Optional tone and style instructions for the model"}
                </span>
              </button>

              {/* === Divider === */}
              <hr className="settings-divider" />

              {/* === Tools Section (collapsible) === */}
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginTop: 8, marginBottom: 8 }}
                onClick={() => setAgentToolsExpanded(!agentToolsExpanded)}
              >
                <p className="settings-group-title">Tools</p>
                <button
                  className={`settings-expand-btn ${agentToolsExpanded ? "expanded" : "collapsed"}`}
                  aria-label="Expand or collapse tools"
                >
                  <MsIcon name="expand_more" size={18} />
                </button>
              </div>

              {agentToolsExpanded && (
                <>
                  {/* Code execution */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px 0" }}>
                    <h3 className="settings-item-label">Code execution</h3>
                    <SettingsToggle label="Code execution" checked={agentCodeExecution} onChange={setAgentCodeExecution} />
                  </div>

                  {/* Grounding with Google Search + source sublabel */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", margin: "0 0 12px 0" }}>
                    <div>
                      <h3 className="settings-item-label">Grounding with Google Search</h3>
                      <span
                        style={{
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: "11px",
                          fontWeight: 400,
                          lineHeight: "16px",
                          color: "var(--color-v3-text-var)",
                        }}
                      >
                        Source: Google Search
                      </span>
                    </div>
                    <SettingsToggle label="Grounding with Google Search" checked={agentGroundingSearch} onChange={setAgentGroundingSearch} />
                  </div>

                  {/* URL context */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px 0" }}>
                    <h3 className="settings-item-label">URL context</h3>
                    <SettingsToggle label="URL context" checked={agentUrlContext} onChange={setAgentUrlContext} />
                  </div>

                  {/* Filesystem tools */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 8px 0" }}>
                    <h3 className="settings-item-label">Filesystem tools</h3>
                    <SettingsToggle label="Filesystem tools" checked={agentFilesystemTools} onChange={setAgentFilesystemTools} disabled />
                  </div>
                </>
              )}

              {/* === Environment Section (collapsible) === */}
              <hr className="settings-divider" style={{ margin: 0 }} />
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginTop: 8, marginBottom: 8 }}
                onClick={() => setAgentEnvExpanded(!agentEnvExpanded)}
              >
                <p className="settings-group-title">Environment</p>
                <button
                  className={`settings-expand-btn ${agentEnvExpanded ? "expanded" : "collapsed"}`}
                  aria-label="Expand or collapse environment"
                >
                  <MsIcon name="expand_more" size={18} />
                </button>
              </div>

              {agentEnvExpanded && (
                <>
                  <p
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      lineHeight: "18px",
                      color: "var(--color-v3-text-var)",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Each execution spins up an isolated environment where your agent can run code and manage files.{" "}
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ color: "var(--color-v3-outline-accent)", textDecoration: "none" }}
                    >
                      Learn more
                    </a>
                  </p>

                  {/* Type — New / Existing pill toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px 0" }}>
                    <h3 className="settings-item-label">Type</h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "2px",
                        borderRadius: "9999px",
                        background: "var(--color-v3-surface-container)",
                        border: "1px solid var(--color-v3-outline-var)",
                      }}
                    >
                      {(["New", "Existing"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setAgentEnvType(t)}
                          style={{
                            height: "26px",
                            padding: "0 12px",
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: "12px",
                            fontWeight: 500,
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "9999px",
                            background:
                              agentEnvType === t
                                ? "var(--color-v3-surface-container-highest)"
                                : "transparent",
                            color:
                              agentEnvType === t
                                ? "var(--color-v3-text)"
                                : "var(--color-v3-text-var)",
                            transition: "color 0.15s, background 0.15s",
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sources */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px 0" }}>
                    <h3 className="settings-item-label">Sources</h3>
                    <button className="settings-btn-borderless">Add sources</button>
                  </div>

                  {/* Network */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 8px 0" }}>
                    <h3 className="settings-item-label">Network</h3>
                    <button className="settings-btn-borderless">Add rules</button>
                  </div>
                </>
              )}
</>
          ) : (
            <>
              {/* ══════════════════════════════════════════ */}
              {/*  MODEL CONFIG VIEW (existing)             */}
              {/* ══════════════════════════════════════════ */}

              {/* === Model Selector Card === */}
              <button
                className="settings-card"
                style={{ marginBottom: 8 }}
                onClick={() => setShowModelSelection(true)}
              >
                <span className="card-title">{currentSelectedModel.name}</span>
                <span className="card-subtitle" style={{ display: 'block', marginBottom: 2 }}>
                  {currentSelectedModel.id}
                </span>
                <span className="card-subtitle">
                  {currentSelectedModel.description}
                </span>
              </button>

              {/* === System Instructions Card === */}
              <button
                className="settings-card"
                style={{ marginBottom: 8 }}
                onClick={() => setShowSystemInstructions(true)}
              >
                <span className="card-title">System instructions</span>
                <span className="card-subtitle">
                  {currentRunSettings.systemInstruction.length > 80
                    ? `${currentRunSettings.systemInstruction.substring(0, 80)}...`
                    : currentRunSettings.systemInstruction || "Optional tone and style instructions for the model"}
                </span>
              </button>

              {/* === Divider === */}
              <hr className="settings-divider" />

              {/* === Temperature === */}
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: -10, width: '100%' }}>
                  <h3 className="settings-item-label">Temperature</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%', marginTop: 16 }}>
                  <Slider
                    value={[currentRunSettings.temperature]}
                    onValueChange={([temperature]) => updateRunSettings({ temperature })}
                    max={2}
                    step={0.05}
                    className="flex-1"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    className="settings-slider-input"
                    value={currentRunSettings.temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 2) updateRunSettings({ temperature: val });
                    }}
                  />
                </div>
              </div>

              {/* === Thinking Level Section === */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <h3 className="settings-item-label">Thinking level</h3>
                </div>
                <Select value={thinkingLevel} onValueChange={setThinkingLevel}>
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Off">Off</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* === Divider === */}
              <hr className="settings-divider" />

              {/* === Tools Section Header (collapsible) === */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginTop: 8, marginBottom: 8 }}
                onClick={() => setToolsExpanded(!toolsExpanded)}
              >
                <p className="settings-group-title">Tools</p>
                <button
                  className={`settings-expand-btn ${toolsExpanded ? 'expanded' : 'collapsed'}`}
                  aria-label="Expand or collapse tools"
                >
                  <MsIcon name="expand_more" size={18} />
                </button>
              </div>

              {/* === Tool Toggles (visible when expanded) === */}
              {toolsExpanded && (
                <>
                  {/* Structured outputs */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px 0' }}>
                    <h3 className="settings-item-label">Structured outputs</h3>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <SettingsToggle label="Structured outputs" checked={structuredOutputs} onChange={setStructuredOutputs} />
                      <button className="settings-btn-borderless" disabled={!structuredOutputs} style={{ order: -1 }}>
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Code execution */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px 0' }}>
                    <h3 className="settings-item-label">Code execution</h3>
                    <SettingsToggle label="Code execution" checked={codeExecution} onChange={setCodeExecution} />
                  </div>

                  {/* Function calling */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px 0' }}>
                    <h3 className="settings-item-label">Function calling</h3>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <SettingsToggle label="Function calling" checked={functionCalling} onChange={setFunctionCalling} />
                      <button className="settings-btn-borderless" disabled={!functionCalling} style={{ order: -1 }}>
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Grounding with Google Search */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px 0' }}>
                    <h3 className="settings-item-label">Grounding with Google Search</h3>
                    <SettingsToggle label="Grounding with Google Search" checked={groundingSearch} onChange={setGroundingSearch} />
                  </div>

                  {/* Grounding with Google Maps */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px 0' }}>
                    <h3 className="settings-item-label">Grounding with Google Maps</h3>
                    <SettingsToggle label="Grounding with Google Maps" checked={groundingMaps} onChange={setGroundingMaps} />
                  </div>

                  {/* URL context */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 8px 0' }}>
                    <h3 className="settings-item-label">URL context</h3>
                    <SettingsToggle label="URL context" checked={urlContext} onChange={setUrlContext} />
                  </div>
                </>
              )}

              {/* === Divider === */}
              <hr className="settings-divider" />

              {/* === Advanced Settings Header (collapsed by default) === */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginTop: 8, marginBottom: 8 }}
                onClick={() => setAdvancedExpanded(!advancedExpanded)}
              >
                <p className="settings-group-title">Advanced settings</p>
                <button
                  className={`settings-expand-btn ${advancedExpanded ? 'expanded' : 'collapsed'}`}
                  aria-label="Expand or collapse advanced settings"
                >
                  <MsIcon name="expand_more" size={18} />
                </button>
              </div>

              {/* Advanced settings content (when expanded) */}
              {advancedExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Top P */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: -10, width: '100%' }}>
                      <h3 className="settings-item-label">Top P</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%', marginTop: 16 }}>
                      <Slider
                        value={[currentRunSettings.topP]}
                        onValueChange={([topP]) => updateRunSettings({ topP })}
                        max={1}
                        step={0.05}
                        className="flex-1"
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        className="settings-slider-input"
                        value={currentRunSettings.topP}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0 && val <= 1) updateRunSettings({ topP: val });
                        }}
                      />
                    </div>
                  </div>

                  {/* Add stop sequence */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <h3 className="settings-item-label">Add stop sequence</h3>
                    <button className="settings-btn-borderless">Add stop</button>
                  </div>

                  {/* Output length */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="settings-item-label">Output length</h3>
                    <div style={{
                      height: 28, padding: '0 8px', display: 'flex', alignItems: 'center',
                      border: '1px solid var(--color-v3-outline)', borderRadius: 8,
                      color: 'var(--color-v3-text-var)', fontSize: 12, fontFamily: 'var(--font-inter), sans-serif'
                    }}>
                      {currentRunSettings.maxOutputTokens}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Model selection panel */}
      <Sheet open={showModelSelection} onOpenChange={setShowModelSelection}>
        <SheetContent showClose={false} side="right" className="w-full max-w-[549px] lg:w-[549px] h-screen bg-background/95 border-l border-border backdrop-blur p-0 flex flex-col" style={{ maxWidth: 'min(549px, 100vw)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <SheetTitle className="sr-only">Model selection</SheetTitle>
          <SheetDescription className="sr-only">
            Browse and select a Gemini model for the playground.
          </SheetDescription>
          <div className="model-selector-panel-header">
            <div className="text-foreground text-sm font-medium leading-tight">Model selection</div>
            <button
              aria-label="Close panel"
              onClick={() => setShowModelSelection(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <MsIcon name="close" size={18} />
            </button>
          </div>

          <div className="model-selector-controls">
            <label className="model-search-field">
              <MsIcon name="search" size={18} />
              <input
                aria-label="Search"
                placeholder="Search for a model or agent"
                value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)}
              />
            </label>
            <div className="model-filter-list" aria-label="Model categories">
                {filterTabs.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`model-filter-chip${activeFilter === filter ? " active" : ""}`}
                  >
                    {filter}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-auto-hide px-4 pb-4">
            {filteredModels.length === 0 ? (
              <div className="model-selector-empty">
                {activeFilter === "Agents"
                  ? "Choose Agents in the Playground to use a managed agent."
                  : `No ${activeFilter.toLowerCase()} models found.`}
              </div>
            ) : (
              filteredModels.map((model) => (
                <article key={model.id} className="model-selector-item">
                  <button className="model-selector-main" onClick={() => handleModelSelect(model)}>
                    <span className="model-selector-header">
                      <span className="model-selector-icon">
                        <MsIcon
                          name={model.mode === "image-content" || model.mode === "image-endpoint" ? "image_edit_auto" : model.mode === "video" ? "video_spark" : model.mode === "audio" ? "video_camera_front" : "spark"}
                          size={20}
                        />
                      </span>
                      <span className="model-selector-copy">
                        <span className="model-selector-title-row">
                          <span className="model-selector-title">{model.name}</span>
                          {model.badges?.map((badge) => (
                            <span key={badge} className={`model-selector-badge ${badge.toLowerCase()}`}>
                              {badge}
                            </span>
                          ))}
                        </span>
                        <span className="model-selector-id">{model.id}</span>
                      </span>
                    </span>
                    <span className="model-selector-details">
                      {model.features.map((feature) => (
                        <span key={feature} className="model-selector-detail">
                          <MsIcon name="spark" size={16} />
                          <span>{feature}</span>
                        </span>
                      ))}
                      <span className="model-selector-detail">
                        <MsIcon name="info" size={16} />
                        <span>{model.description}</span>
                      </span>
                      {model.pricing?.map((price) => (
                        <span key={price} className="model-selector-detail">
                          <MsIcon name="attach_money" size={16} />
                          <span>{price}</span>
                        </span>
                      ))}
                      {model.knowledgeCutoff && (
                        <span className="model-selector-detail">
                          <MsIcon name="network_intelligence_history" size={16} />
                          <span>Knowledge cut off: {model.knowledgeCutoff}</span>
                        </span>
                      )}
                      {model.releaseDate && (
                        <span className="model-selector-detail">
                          <MsIcon name="rocket_launch" size={16} />
                          <span>Release date: {model.releaseDate}</span>
                        </span>
                      )}
                    </span>
                  </button>

                  <div className="model-selector-actions">
                    <button aria-label={model.starred ? "Unstar model" : "Star model"}>
                      <MsIcon name="star" size={16} />
                    </button>
                    <span />
                    <button
                      aria-label="Copy to clipboard"
                      onClick={() => handleCopyModel(model.id)}
                    >
                      {copiedModel === model.id ? <Check className="w-4 h-4 text-green-400" /> : <MsIcon name="content_copy" size={16} />}
                    </button>
                    {model.docsUrl && (
                      <>
                        <span />
                        <a aria-label="Developer guide docs" href={model.docsUrl} target="_blank" rel="noreferrer">
                          <MsIcon name="developer_guide" size={16} />
                        </a>
                      </>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* System Instructions Panel */}
      <Sheet open={showSystemInstructions} onOpenChange={setShowSystemInstructions}>
        <SheetContent showClose={false} side="right" className="w-[505px] h-screen bg-background/95 border-l border-border backdrop-blur p-0 max-w-none flex flex-col" style={{ width: '505px', maxWidth: 'none' }}>
          <SheetTitle className="sr-only">System instructions</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a template or edit the model&apos;s system instructions.
          </SheetDescription>
          {/* Header */}
          <div className="w-full h-12 px-4 pt-4 flex justify-between items-center bg-background/95 backdrop-blur-md border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSystemInstructions(false)} className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-foreground text-sm font-medium font-tight leading-tight">System instructions</div>
            </div>
            <button onClick={() => setShowSystemInstructions(false)} className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-auto-hide px-4 pb-4 flex flex-col">
            {/* Template Selector */}
            <div className="pt-4 pb-6 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-foreground text-sm font-medium font-tight leading-tight flex-1">{selectedTemplate}</div>
                <button className="w-6 h-6 p-1 rounded-lg flex items-center justify-center hover:bg-muted/20 transition-colors">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SYSTEM_INSTRUCTION_TEMPLATES).map((template) => (
                    <SelectItem key={template} value={template}>{template}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Text Editor */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={currentRunSettings.systemInstruction}
                onChange={(e) => updateRunSettings({ systemInstruction: e.target.value })}
                className="flex-1 w-full p-4 rounded-lg border border-border bg-muted/10 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '14px', lineHeight: '1.5', minHeight: '400px' }}
                placeholder="Enter your system instructions here..."
              />
            </div>
          </div>

          {/* Save Button - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex justify-end">
              <button
                onClick={handleSystemInstructionSave}
                className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity"
                style={{ height: '32px', padding: '4px 12px 4px 8px', borderRadius: '12px', border: '1px solid var(--color-v3-outline-var)', background: 'var(--color-v3-button-container)', color: 'var(--color-v3-text)' }}
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
