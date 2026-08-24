"use client";

import { getModelById, MODEL_BROWSER_CATEGORIES } from "@/lib/chat-config";
import { AIS_AGENTS, AIS_AGENT_COLORS } from "@/lib/agent-config";
import { Model } from "@/types/chat";
import { Agent } from "@/types/agent";
import { MsIcon } from "@/components/ui/ms-icon";
import { getAgentMaterialIcon } from "@/components/agent-icon";
import { useLayoutEffect, useRef, useState } from "react";

interface ModelBrowserProps {
  onModelSelect: (model: Model) => void;
  onAgentSelect?: (agent: Agent) => void;
  activeTab?: "models" | "agents";
  onTabChange?: (tab: "models" | "agents") => void;
}

// Exact Google Symbols ligatures from live AI Studio
const categoryIcons: Record<string, string> = {
  star: "star",
  chat: "chat_bubble",
  image: "image",
  movie: "movie",
  mic: "mic",
  bolt: "bolt",
};

const TABS = ["models", "agents"] as const;

export function ModelBrowser({
  onModelSelect,
  onAgentSelect,
  activeTab: activeTabProp,
  onTabChange,
}: ModelBrowserProps) {
  const activeTab = activeTabProp ?? "models";

  // Slide indicator tracks the active toggle button's real geometry (like live AIS)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ x: 0, width: 0 });

  useLayoutEffect(() => {
    const btn = tabRefs.current[activeTab];
    if (btn) setIndicator({ x: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeTab]);

  const handleCardClick = (modelId: string) => {
    const model = getModelById(modelId);

    if (model) {
      onModelSelect(model);
    }
  };

  const handleTabClick = (tab: "models" | "agents") => {
    onTabChange?.(tab);
  };

  const title = activeTab === "models" ? "Explore Google models" : "Build with Agents";

  return (
    <div
      role="region"
      aria-label="Model category grid"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        maxWidth: "1000px",
        minHeight: "412px",
        padding: "0 32px",
      }}
    >
      {/* Title Row: heading left, segment control right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginBottom: "8px",
        }}
      >
        <h1
          className="carousel-title"
          style={{ margin: 0 }}
        >
          {title}
        </h1>

        {/* Toggle group — verbatim live AI Studio: .slide-indicator div animated via
            transform/width 0.2s cubic-bezier(0.4, 0, 0.2, 1), sized to the active button */}
        <div className="toggle-group">
          <div
            className="slide-indicator"
            style={{
              width: `${indicator.width}px`,
              transform: `translateX(${indicator.x}px)`,
            }}
          />
          {TABS.map((tab) => (
            <button
              key={tab}
              ref={(el) => { tabRefs.current[tab] = el; }}
              onClick={() => handleTabClick(tab)}
              className={`toggle-button${activeTab === tab ? " ms-button-active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="model-browser-tab-stack">
          <div
            className={`model-browser-tab-content ${activeTab === "models" ? "active" : "inactive"}`}
            aria-hidden={activeTab !== "models"}
            style={{ width: "100%" }}
          >
            <div className="category-grid">
              {MODEL_BROWSER_CATEGORIES.map((category) => {
                const iconName = categoryIcons[category.icon] ?? category.icon;

                return (
                  <button
                    key={category.id}
                    className="category-card"
                    onClick={() => handleCardClick(category.defaultModelId)}
                  >
                    <div className="card-header">
                      <div
                        className="card-icon-container"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${category.color} 15%, transparent)`,
                        }}
                      >
                        <MsIcon
                          name={iconName}
                          className="card-icon"
                          style={{ color: category.color }}
                        />
                      </div>
                      <h3 className="card-title">{category.title}</h3>
                    </div>
                    <p className="card-description">{category.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Start building — matches live AI Studio CTA below the card grid */}
            <button
              className="start-building-btn"
              onClick={() => handleCardClick(MODEL_BROWSER_CATEGORIES[0].defaultModelId)}
            >
              Start building
            </button>
          </div>

          <div
            className={`model-browser-tab-content ${activeTab === "agents" ? "active" : "inactive"}`}
            aria-hidden={activeTab !== "agents"}
            style={{ width: "100%" }}
          >
            {/* Agent cards — matches live AI Studio Agents tab 1:1 */}
            <div className="category-grid">
              {AIS_AGENTS.map((agent) => {
                const agentIconName = getAgentMaterialIcon(agent.avatar);
                const color = AIS_AGENT_COLORS[agent.id];

                return (
                  <button
                    key={agent.id}
                    className="category-card"
                    onClick={() => onAgentSelect?.(agent)}
                  >
                    <div className="card-header">
                      <div
                        className="card-icon-container"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                        }}
                      >
                        <MsIcon
                          name={agentIconName}
                          className="card-icon"
                          style={{ color }}
                        />
                      </div>
                      <h3 className="card-title">{agent.name}</h3>
                    </div>
                    <p className="card-description">{agent.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Invisible spacer matching the models tab's "Start building" row —
                keeps both tabs the same height so switching causes no layout shift */}
            <div aria-hidden style={{ height: "32px", marginTop: "16px" }} />
          </div>
      </div>
    </div>
  );
}
