"use client";

import React, { useState } from "react";
import { Prism } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FILES, FILE_TREE, BuildFile } from "@/lib/build/files";
import { MsIcon } from "./icon";

const SyntaxHighlighter = Prism as unknown as React.ComponentType<any>;

// Exact Material Symbols glyphs + tree structure lifted from the real AI Studio DOM
const ICON_FOR: Record<BuildFile["icon"], { glyph: string; color: string }> = {
  tsx: { glyph: "segment", color: "text-[#519aba]" },
  ts: { glyph: "segment", color: "text-[#519aba]" },
  css: { glyph: "stylus", color: "text-[#f55385]" },
  json: { glyph: "data_object", color: "text-[#cbcb41]" },
  html: { glyph: "code", color: "text-[#e37933]" },
  error: { glyph: "error", color: "text-[#ffb4ab]" },
  file: { glyph: "draft", color: "text-[#d4d7d6]" },
};

const FOLDERS = FILE_TREE.folders.map((folder) => ({
  name: folder.name,
  children: folder.files,
}));

const ROOT_FILES = FILE_TREE.rootFiles;

function FileRow({
  file,
  depth,
  selected,
  onSelect,
}: {
  file: BuildFile;
  depth: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const icon = ICON_FOR[file.icon];
  return (
    <div
      role="treeitem"
      aria-selected={selected}
      onClick={onSelect}
      className={`group flex h-6 w-full cursor-pointer items-center gap-1.5 rounded-lg pr-0.5 text-[13px] ${
        selected ? "bg-[#2a2a2a] text-[#e2e2e5]" : "text-[#e2e2e5] hover:bg-[#252525]"
      }`}
      style={{ paddingLeft: 12 + depth * 14 }}
    >
      <MsIcon name={icon.glyph} size={16} className={icon.color} />
      <span className={`flex-1 truncate ${file.icon === "error" ? "text-[#f14c4c]" : ""}`}>
        {file.name}
      </span>
      <button
        aria-label={`See more actions for ${file.name}`}
        disabled
        title="File actions are coming soon"
        onClick={(event) => event.stopPropagation()}
        className={`flex h-5 w-5 cursor-not-allowed items-center justify-center rounded text-[#666] ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <MsIcon name="more_vert" size={14} />
      </button>
    </div>
  );
}

export function CodePanel() {
  const [selectedPath, setSelectedPath] = useState("metadata.json");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    assets: false,
    ".aistudio": false,
    src: true,
  });

  const file = FILES[selectedPath];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchesSearch = (path: string) =>
    !normalizedQuery || path.toLowerCase().includes(normalizedQuery);

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      {/* File explorer */}
      <div className="flex w-[187px] shrink-0 flex-col border-r border-[#333333]">
        <div className="flex h-12 shrink-0 items-center justify-between pl-4 pr-1">
          {searchOpen ? (
            <input
              autoFocus
              aria-label="Search files"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchOpen(false);
                  setSearchQuery("");
                }
              }}
              placeholder="Search files"
              className="h-7 min-w-0 flex-1 rounded-md border border-[#444] bg-[#252525] px-2 text-[12px] text-[#e2e2e5] outline-none focus:border-[#8ab4f8]"
            />
          ) : (
            <span className="truncate text-[13px] text-[#9a9a9a]">File explorer</span>
          )}
          <div className="flex items-center">
            <button
              aria-label={searchOpen ? "Close file search" : "Search in files"}
              aria-pressed={searchOpen}
              onClick={() => {
                setSearchOpen((open) => !open);
                if (searchOpen) setSearchQuery("");
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
            >
              <MsIcon name="search" size={16} />
            </button>
            <button
              disabled
              title="Adding files is coming soon"
              aria-label="Add items to file explorer"
              className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-full text-[#666]"
            >
              <MsIcon name="add_circle" size={16} />
            </button>
            <button
              aria-label="Collapse all folders"
              onClick={() => setOpenFolders({ assets: false, ".aistudio": false, src: false })}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
            >
              <MsIcon name="collapse_all" size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {FOLDERS.map((folder) => {
            const open = openFolders[folder.name];
            return (
              <div key={folder.name}>
                <div
                  role="treeitem"
                  aria-expanded={open}
                  aria-selected={false}
                  tabIndex={0}
                  onClick={() =>
                    setOpenFolders((o) => ({ ...o, [folder.name]: !o[folder.name] }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpenFolders((current) => ({
                        ...current,
                        [folder.name]: !current[folder.name],
                      }));
                    }
                  }}
                  className="group flex h-6 w-full cursor-pointer items-center gap-1.5 rounded-lg pl-3 pr-0.5 text-[13px] text-[#e2e2e5] hover:bg-[#252525]"
                >
                  <MsIcon name="folder" size={16} className="text-[#d4d7d6]" />
                  <MsIcon
                    name={open ? "expand_more" : "chevron_right"}
                    size={16}
                    className="-ml-1 text-[#d4d7d6]"
                  />
                  <span className="flex-1 truncate">{folder.name}</span>
                  <button
                    aria-label={`See more actions for ${folder.name}`}
                    disabled
                    title="Folder actions are coming soon"
                    onClick={(event) => event.stopPropagation()}
                    className="flex h-5 w-5 cursor-not-allowed items-center justify-center rounded text-[#666] opacity-0 group-hover:opacity-100"
                  >
                    <MsIcon name="more_vert" size={14} />
                  </button>
                </div>
                {open &&
                  folder.children.filter(matchesSearch).map((path) => (
                    <FileRow
                      key={path}
                      file={FILES[path]}
                      depth={1}
                      selected={selectedPath === path}
                      onSelect={() => setSelectedPath(path)}
                    />
                  ))}
              </div>
            );
          })}
          {ROOT_FILES.filter(matchesSearch).map((path) => (
            <FileRow
              key={path}
              file={FILES[path]}
              depth={0}
              selected={selectedPath === path}
              onSelect={() => setSelectedPath(path)}
            />
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between px-3">
          <div className="flex h-8 items-center gap-2 rounded-lg bg-[#2f3239] px-3 text-[13px] text-[#e3e3e3]">
            <MsIcon
              name={ICON_FOR[file.icon].glyph}
              size={14}
              className={ICON_FOR[file.icon].color}
            />
            {file.name}
          </div>
          <button
            aria-label={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
            aria-pressed={showLineNumbers}
            onClick={() => setShowLineNumbers((visible) => !visible)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
          >
            <MsIcon name="settings" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <SyntaxHighlighter
            language={file.language}
            style={vscDarkPlus}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              padding: "8px 0",
              background: "transparent",
              fontSize: 12,
              lineHeight: "18px",
              minHeight: "100%",
            }}
            lineNumberStyle={{
              minWidth: "3.25em",
              paddingRight: "1.25em",
              color: "#6e7681",
              userSelect: "none",
            }}
            codeTagProps={{
              style: {
                fontFamily: "'Space Mono', Menlo, Monaco, 'Courier New', monospace",
              },
            }}
          >
            {file.content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
