"use client";

import { Check } from "lucide-react";

interface AgentInstructionsChecklistProps {
  steps: string[];
}

export function AgentInstructionsChecklist({ steps }: AgentInstructionsChecklistProps) {
  if (!steps || steps.length < 2) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <span
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          lineHeight: "16px",
          color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "12px",
        }}
      >
        Agent Instructions
      </span>
      {steps.map((step, index) => (
        <div key={index} style={{ display: "flex", gap: "10px" }}>
          {/* Left column: circle + connector line */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexShrink: 0,
              width: "20px",
            }}
          >
            {/* Green circle with check icon */}
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.15)",
                border: "1.5px solid #22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Check
                style={{
                  width: "11px",
                  height: "11px",
                  color: "#22c55e",
                  strokeWidth: 3,
                }}
              />
            </div>
            {/* Dotted connector line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  width: "2px",
                  flex: 1,
                  minHeight: "12px",
                  borderLeft: "2px dotted rgba(255, 255, 255, 0.12)",
                }}
              />
            )}
          </div>
          {/* Step text */}
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: "20px",
              color: "var(--color-v3-text, hsl(var(--foreground)))",
              paddingBottom: index < steps.length - 1 ? "12px" : "0",
            }}
          >
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
