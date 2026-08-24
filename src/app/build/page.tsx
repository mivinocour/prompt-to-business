"use client";

import { useEffect, useRef, useState } from "react";
import { MsIcon } from "@/components/build/icon";
import { motion, AnimatePresence } from "framer-motion";
import { BuildHeader } from "@/components/build/build-header";
import { AssistantPanel } from "@/components/build/assistant-panel";
import {
  PreviewPanel,
  PreviewToolbarControls,
  EditModeButton,
  type PreviewDevice,
} from "@/components/build/preview-panel";
import { CodePanel } from "@/components/build/code-panel";
import { SettingsDrawer, type SettingsTab } from "@/components/build/settings-drawer";
import { FILES } from "@/lib/build/files";

type View = "preview" | "code";

function ViewToggle({ view, setView }: { view: View; setView: (v: View) => void }) {
  const Pill = ({ v, label }: { v: View; label: string }) => {
    const active = view === v;
    return (
      <button
        onClick={() => setView(v)}
        className={`relative flex h-8 items-center rounded-xl border text-[14px] font-medium transition-colors ${
          active
            ? "border-[#333333] bg-[#2a2a2a] pl-[26px] pr-3 text-[#fcfcfc]"
            : "border-[#262626] bg-[#1f1f1f] px-3 text-[#d4d4d4] hover:border-[#333333] hover:bg-[#323232] hover:text-[#fcfcfc]"
        }`}
      >
        {active && (
          <span className="absolute left-3 h-[7px] w-[7px] rounded-full bg-[#fcfcfc]" />
        )}
        {label}
      </button>
    );
  };
  return (
    <div className="flex items-center gap-1.5">
      <Pill v="preview" label="Preview" />
      <Pill v="code" label="Code" />
    </div>
  );
}

function ExportMenu({ onDownload }: { onDownload: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 items-center gap-1.5 rounded-xl border border-transparent px-3 text-[14px] font-medium text-[#d4d4d4] transition-colors hover:border-[#333333] hover:bg-[#323232] hover:text-[#fcfcfc] ${
          open ? "border-[#333333] bg-[#323232] text-[#fcfcfc]" : ""
        }`}
      >
        Export
        <MsIcon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-10 z-50 w-[260px] rounded-2xl border border-[#333333] bg-[#232323] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <button
              disabled
              title="Antigravity export is coming soon"
              className="flex w-full cursor-not-allowed items-start gap-3 rounded-xl px-3 py-2.5 text-left opacity-50"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2f2f2f] text-[13px] font-semibold text-[#8ab4f8]">
                A
              </span>
              <span>
                <span className="block text-[14px] font-medium text-[#e3e3e3]">
                  Export to Antigravity
                </span>
                <span className="block text-[12.5px] text-[#9a9a9a]">Open in Antigravity</span>
              </span>
            </button>
            <button
              onClick={() => {
                onDownload();
                setOpen(false);
              }}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#2f2f2f]"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2f2f2f] text-[#d4d4d4]">
                <MsIcon name="download" size={16} />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-[#e3e3e3]">
                  Download project snapshot
                </span>
                <span className="block text-[12.5px] text-[#9a9a9a]">
                  JSON archive containing every project file
                </span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BuildPage() {
  const [title, setTitle] = useState("Todo List");
  const [view, setView] = useState<View>("preview");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [previewResetKey, setPreviewResetKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("Chat");
  const previewRef = useRef<HTMLDivElement>(null);

  const openSettings = (tab: SettingsTab) => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  const downloadProject = () => {
    const files = Object.fromEntries(
      Object.values(FILES).map((file) => [file.path, file.content])
    );
    const blob = new Blob([JSON.stringify({ name: title, files }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "app"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#191919] font-sans text-[#d4d4d4]">
      <BuildHeader
        title={title}
        onTitleChange={setTitle}
        onOpenSettings={() => openSettings("Chat")}
        onOpenShare={() => openSettings("Share")}
        onOpenPublish={() => openSettings("Publish")}
        onRemix={() => setTitle((current) => `${current} copy`)}
      />
      <SettingsDrawer
        open={settingsOpen}
        initialTab={settingsTab}
        appTitle={title}
        onClose={() => setSettingsOpen(false)}
      />
      <div className="flex min-h-0 flex-1 bg-[#1f1f1f]">
        <AssistantPanel onViewChanges={() => setView("code")} />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Right panel toolbar */}
          <div className="flex h-14 shrink-0 items-center justify-between px-3">
            <div className="w-[280px]">
              <ViewToggle view={view} setView={setView} />
            </div>
            {view === "preview" ? (
              <>
                <PreviewToolbarControls
                  device={previewDevice}
                  onDeviceChange={setPreviewDevice}
                  onRefresh={() => setPreviewResetKey((key) => key + 1)}
                  onFullscreen={() => previewRef.current?.requestFullscreen()}
                />
                <div className="flex w-[280px] justify-end">
                  <EditModeButton />
                </div>
              </>
            ) : (
              <div className="flex flex-1 justify-end">
                <ExportMenu onDownload={downloadProject} />
              </div>
            )}
          </div>
          {/* Content */}
          <div ref={previewRef} className="flex min-h-0 flex-1 flex-col bg-[#1f1f1f]">
            {view === "preview" ? (
              <PreviewPanel device={previewDevice} resetKey={previewResetKey} />
            ) : (
              <CodePanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
