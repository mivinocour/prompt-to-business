"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MsIcon } from "./icon";

export function BuildHeader({
  title = "Todo List",
  onTitleChange,
  onOpenSettings,
  onOpenShare,
  onOpenPublish,
  onRemix,
}: {
  title?: string;
  onTitleChange?: (title: string) => void;
  onOpenSettings?: () => void;
  onOpenShare?: () => void;
  onOpenPublish?: () => void;
  onRemix?: () => void;
}) {
  const [hoverTitle, setHoverTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => setDraftTitle(title), [title]);

  const saveTitle = () => {
    const nextTitle = draftTitle.trim();
    if (nextTitle) onTitleChange?.(nextTitle);
    else setDraftTitle(title);
    setEditingTitle(false);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-3 bg-[#191919]">
      {/* Left */}
      <div className="flex min-w-[180px] flex-1 items-center">
        <Link
          href="/"
          className="flex h-8 items-center gap-2 rounded-xl border border-[#333333] bg-[#323232] px-3 text-[14px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#424242]"
        >
          <MsIcon name="arrow_back" />
          Back to start
        </Link>
      </div>

      {/* Center title */}
      <div
        className="flex items-center gap-1"
        onMouseEnter={() => setHoverTitle(true)}
        onMouseLeave={() => setHoverTitle(false)}
      >
        {editingTitle ? (
          <input
            aria-label="App name"
            autoFocus
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveTitle();
              if (event.key === "Escape") {
                setDraftTitle(title);
                setEditingTitle(false);
              }
            }}
            className="h-8 w-[220px] rounded-lg border border-[#4a4a4a] bg-[#252525] px-3 text-center text-[14px] text-[#e3e3e3] outline-none focus:border-[#8ab4f8]"
          />
        ) : (
          <>
            <span className="max-w-[240px] truncate text-[14px] font-normal text-[#e3e3e3]">
              {title}
            </span>
            <button
              aria-label="Edit app name"
              onClick={() => setEditingTitle(true)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc] ${
                hoverTitle ? "opacity-100" : "opacity-0"
              }`}
            >
              <MsIcon name="edit" />
            </button>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex min-w-[460px] flex-[2] items-center justify-end gap-2">
        <button
          aria-label="Copy app"
          onClick={onRemix}
          className="flex h-8 items-center gap-1.5 rounded-xl border border-transparent px-3 text-[14px] font-medium text-[#d4d4d4] transition-colors hover:border-[#333333] hover:bg-[#323232] hover:text-[#fcfcfc]"
        >
          <MsIcon name="arrow_split" />
          Remix
        </button>
        <button
          aria-label="Open sharing settings"
          onClick={onOpenShare}
          className="flex h-8 items-center rounded-xl border border-[#333333] bg-[#323232] px-3 text-[14px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#424242]"
        >
          Share
        </button>
        <button
          aria-label="Open publish settings"
          onClick={onOpenPublish}
          className="flex h-8 items-center rounded-xl border border-[#333333] px-3 text-[14px] font-medium text-[#d4d4d4] transition-colors hover:bg-[#323232] hover:text-[#fcfcfc]"
        >
          Publish
        </button>
        <a
          aria-label="Submit bug"
          href="https://github.com/ammaarreshi/ais-prototype/issues/new"
          target="_blank"
          rel="noreferrer"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
        >
          <MsIcon name="bug_report" />
        </a>
        <button
          aria-label="Settings"
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
        >
          <MsIcon name="settings" />
        </button>
      </div>
    </header>
  );
}
