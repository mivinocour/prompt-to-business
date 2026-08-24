"use client";

import { MsIcon } from "@/components/ui/ms-icon";

// ─── Playground header — matches live AI Studio MS-HEADER 1:1 ───
// h-56, padding 16px 20px 8px; left: squircle menu_open btn + 16/500 title;
// right: share / compare_arrows / add / more_vert icon buttons (exact Google Symbols).

const iconBtnStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
};

function HeaderIconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      style={iconBtnStyle}
      className="ms-icon-btn"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function PlaygroundHeader({
  title = "Playground",
  editable = false,
  tokenCount,
  onToggleNav,
}: {
  title?: string;
  editable?: boolean;
  tokenCount?: number;
  onToggleNav?: () => void;
}) {
  return (
    <div
      className="w-full flex items-center justify-between flex-shrink-0"
      style={{
        height: "56px",
        padding: "16px 20px 8px",
        backgroundColor: "var(--color-v3-overlay-background)",
      }}
    >
      {/* Left: toggle-nav squircle + title */}
      <div className="flex items-center" style={{ gap: "12px" }}>
        <button
          aria-label="Toggle navigation menu"
          onClick={onToggleNav}
          style={{
            ...iconBtnStyle,
            backgroundColor: "var(--color-v3-surface-container-highest)",
            color: "var(--color-v3-text)",
          }}
          className="ms-icon-btn"
        >
          <MsIcon name="menu_open" />
        </button>
        <h1
          style={{
            color: "var(--color-v3-text)",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: "24px",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {editable && (
          <button
            aria-label="Rename prompt"
            style={{ width: "24px", height: "24px" }}
            className="ms-icon-btn"
          >
            <MsIcon name="edit" size={16} />
          </button>
        )}
        {typeof tokenCount === "number" && (
          <span
            style={{
              color: "var(--color-v3-text-var)",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "18px",
            }}
          >
            {tokenCount.toLocaleString()} tokens
          </span>
        )}
      </div>

      {/* Right: action icons */}
      <div className="flex items-center" style={{ gap: "4px" }}>
        <HeaderIconButton label="Share prompt">
          <MsIcon name="share" />
        </HeaderIconButton>
        <HeaderIconButton label="Compare mode">
          <MsIcon name="compare_arrows" />
        </HeaderIconButton>
        <HeaderIconButton label="New prompt">
          <MsIcon name="add" />
        </HeaderIconButton>
        <HeaderIconButton label="View more actions">
          <MsIcon name="more_vert" />
        </HeaderIconButton>
      </div>
    </div>
  );
}
