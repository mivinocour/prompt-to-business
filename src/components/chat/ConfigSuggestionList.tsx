import { Check } from "lucide-react";
import { ConfigSuggestion } from "@/types/chat";

interface ConfigSuggestionListProps {
  suggestions: ConfigSuggestion[];
  onAccept: (index: number) => void;
  onDismiss: (index: number) => void;
}

export function ConfigSuggestionList({
  onAccept,
  onDismiss,
  suggestions,
}: ConfigSuggestionListProps) {
  const visibleSuggestions = suggestions
    .map((suggestion, index) => ({ suggestion, index }))
    .filter(({ suggestion }) => suggestion.status !== "dismissed");

  if (visibleSuggestions.length === 0) return null;

  return (
    <div className="mt-2 flex max-w-[480px] flex-col gap-2">
      {visibleSuggestions.map(({ suggestion, index }) => {
        const isApplied = suggestion.status === "applied";

        return (
          <div
            key={`${suggestion.type}-${suggestion.itemId}-${index}`}
            className="flex flex-col gap-1.5 rounded-xl border px-3.5 py-2.5"
            style={{
              borderColor: isApplied
                ? "rgba(34, 197, 94, 0.4)"
                : "rgba(255, 255, 255, 0.1)",
              background: isApplied
                ? "rgba(34, 197, 94, 0.06)"
                : "rgba(255, 255, 255, 0.03)",
            }}
          >
            <div className="flex items-center gap-1.5">
              {isApplied && <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />}
              <span
                className="text-[13px] font-semibold"
                style={{
                  color: isApplied
                    ? "#22c55e"
                    : "var(--color-v3-text, hsl(var(--foreground)))",
                }}
              >
                {isApplied ? "Applied" : suggestion.label}
              </span>
            </div>
            <span
              className="text-xs leading-[18px]"
              style={{ color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))" }}
            >
              {suggestion.details}
            </span>
            {suggestion.status === "pending" && (
              <div className="mt-0.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(index)}
                  className="flex h-7 items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-3 text-xs font-semibold text-green-500"
                >
                  <Check className="h-3 w-3" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => onDismiss(index)}
                  className="h-7 rounded-lg border border-white/10 bg-transparent px-3 text-xs font-medium"
                  style={{ color: "var(--color-v3-text-var, hsl(var(--muted-foreground)))" }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
