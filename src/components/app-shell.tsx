"use client";

import { useState } from "react";
import { Menu, Settings2 } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { ModelConfigPanel } from "@/components/model-config-panel";
import { AgentEditDrawer } from "@/components/agent-edit-drawer";
import { Button } from "@/components/ui/button";
import { MyAppsDashboard } from "@/components/my-apps-dashboard";
import {
  DEFAULT_IMAGE_SETTINGS,
  DEFAULT_RUN_SETTINGS,
} from "@/lib/chat-config";
import { Model, RunSettings } from "@/types/chat";
import { Agent } from "@/types/agent";

interface AppShellProps {
  apiKeyConfigured: boolean;
  initialSelectedModel: Model;
  initialView?: "playground" | "my_apps";
}

export function AppShell({
  apiKeyConfigured,
  initialSelectedModel,
  initialView = "playground",
}: AppShellProps) {
  const [activeNav, setActiveNav] = useState<string>(initialView);
  const [selectedModel, setSelectedModel] = useState(initialSelectedModel);
  const [runSettings, setRunSettings] = useState<RunSettings>(DEFAULT_RUN_SETTINGS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModelConfigOpen, setIsModelConfigOpen] = useState(false);

  // Agent state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAgentEditOpen, setIsAgentEditOpen] = useState(false);
  const [browserTab, setBrowserTab] = useState<"models" | "agents">("models");

  const closeMobilePanels = () => {
    setIsSidebarOpen(false);
    setIsModelConfigOpen(false);
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    closeMobilePanels();
  };

  const handleModelChange = (model: Model) => {
    setSelectedModel(model);
    setSelectedAgent(null); // Deselect agent when model is explicitly chosen
  };

  const handleAgentChange = (updatedAgent: Agent) => {
    setSelectedAgent(updatedAgent);
  };

  const handleBackToHome = () => {
    setSelectedAgent(null);
    setBrowserTab("agents");
  };

  return (
    <main className="relative flex h-screen max-h-screen overflow-hidden" style={{ height: "100dvh" }}>
      <div className="absolute top-4 left-4 z-50 flex gap-2 lg:hidden">
        <Button
          aria-label="Toggle navigation"
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen((previousState) => !previousState)}
          className="bg-background/80 backdrop-blur-sm border-border"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-50 lg:hidden">
        <Button
          aria-label="Toggle run settings"
          variant="outline"
          size="sm"
          onClick={() => setIsModelConfigOpen((previousState) => !previousState)}
          className="bg-background/80 backdrop-blur-sm border-border"
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {(isSidebarOpen || isModelConfigOpen) && (
        <button
          type="button"
          aria-label="Close open panels"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          onClick={closeMobilePanels}
        />
      )}

      <div
        className={`
          fixed z-40 h-full transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar
          onMobileClose={() => setIsSidebarOpen(false)}
          activeNav={activeNav}
          onNavigate={(nav) => setActiveNav(nav)}
        />
      </div>

      {activeNav === "my_apps" ? (
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          <MyAppsDashboard />
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <ChatInterface
              selectedModel={selectedModel}
              selectedAgent={selectedAgent ?? undefined}
              imageSettings={DEFAULT_IMAGE_SETTINGS}
              runSettings={runSettings}
              apiKeyConfigured={apiKeyConfigured}
              onModelChange={handleModelChange}
              onAgentSelect={handleAgentSelect}
              onAgentChange={handleAgentChange}
              browserTab={browserTab}
              onBrowserTabChange={setBrowserTab}
              onBackToHome={handleBackToHome}
            />
          </div>

          <div
            className={`
              fixed right-0 z-40 h-full transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
              ${isModelConfigOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            `}
          >
            <ModelConfigPanel
              selectedModel={selectedModel}
              selectedAgent={selectedAgent ?? undefined}
              onModelChange={handleModelChange}
              onAgentChange={handleAgentChange}
              onEditAgent={() => setIsAgentEditOpen(true)}
              runSettings={runSettings}
              onRunSettingsChange={setRunSettings}
              apiKeyConfigured={apiKeyConfigured}
              onMobileClose={() => setIsModelConfigOpen(false)}
            />
          </div>
        </>
      )}

      {/* Agent Edit Drawer */}
      {selectedAgent && (
        <AgentEditDrawer
          open={isAgentEditOpen}
          onOpenChange={setIsAgentEditOpen}
          agent={selectedAgent}
          onAgentChange={handleAgentChange}
        />
      )}
    </main>
  );
}
