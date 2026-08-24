"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Link as LinkIcon,
  Globe,
  ArrowLeft,
  Info,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Copy,
  RotateCw,
  Loader2,
  DollarSign,
  CheckSquare,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";

interface PublishFlowProps {
  appTitle?: string;
  onClose?: () => void;
  onNavigateToEarn?: () => void;
}

export function PublishFlow({
  appTitle = "Todo List",
  onClose: _onClose,
  onNavigateToEarn,
}: PublishFlowProps) {
  // Steps: 0 = Intro ("What does publishing look like?"), 1 = Billing/Project, 2 = Spend Cap, 3 = Final touches, 4 = Success/Live
  const [step, setStep] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState("Vinocour AIS");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // Spend cap state
  const [spendCapSet, setSpendCapSet] = useState(false);
  const [spendCapAmount, setSpendCapAmount] = useState("25");
  const [showSpendCapModal, setShowSpendCapModal] = useState(false);

  // Final touches state
  const isTodo = appTitle.toLowerCase().includes("todo") || appTitle.toLowerCase().includes("task");
  const isSonora = appTitle.toLowerCase().includes("sonora") || appTitle.toLowerCase().includes("audio");

  const defaultSubtitle = isTodo
    ? "Task management and productivity app"
    : isSonora
    ? "Mobile audible bookshelf"
    : "AI-powered web application";

  const defaultDesc = isTodo
    ? "Task management and productivity app with task filtering, status tracking, and responsive layout."
    : isSonora
    ? "Mobile audible bookshelf with text-to-speech narration and curated book collections."
    : `Production web app built with modern design and interactive capabilities.`;

  const defaultSlug = isTodo
    ? "todo-app-1"
    : appTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "app-1";

  const [description, setDescription] = useState(defaultDesc);
  const [appUrl, setAppUrl] = useState(defaultSlug);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setStep(4);
    }, 1400);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${appUrl}.ai.studio`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("AIzaSyD9-38f01a89c37eA-Q");
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  return (
    <div className="flex h-full flex-col font-sans text-[#d4d4d4]">
      {/* Step Header (for Steps 1, 2, 3) */}
      {step >= 1 && step <= 3 && (
        <div className="flex flex-col gap-3 pb-6 pt-1">
          {/* Top Title Bar with Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[15px] font-medium text-[#fcfcfc]">Publish your app</h2>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}
                  onClick={() => setShowInfoTooltip((prev) => !prev)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[#8c8c8c] hover:text-[#e3e3e3]"
                  aria-label="Publishing information"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
                {showInfoTooltip && (
                  <div className="absolute left-0 top-6 z-50 w-64 rounded-xl border border-[#383838] bg-[#232323] p-3 text-[12px] leading-relaxed text-[#c4c7c7] shadow-xl">
                    Publishing provisions your application container in your connected Google Cloud Project and assigns a public SSL URL.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3-Segment Progress Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`h-1 rounded-full transition-colors duration-300 ${
                step >= 1 ? "bg-[#8ab4f8]" : "bg-[#333333]"
              }`}
            />
            <div
              className={`h-1 rounded-full transition-colors duration-300 ${
                step >= 2 ? "bg-[#8ab4f8]" : "bg-[#333333]"
              }`}
            />
            <div
              className={`h-1 rounded-full transition-colors duration-300 ${
                step >= 3 ? "bg-[#8ab4f8]" : "bg-[#333333]"
              }`}
            />
          </div>

          {/* Step Subtitle / Back navigation */}
          <div className="flex items-center gap-2 pt-1 text-[13px] text-[#9a9a9a]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 text-[#d4d4d4] hover:text-[#fcfcfc]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>
                  {step === 2 && "Step 2  Control Gemini API usage"}
                  {step === 3 && "Step 3  Final touches"}
                </span>
              </button>
            ) : (
              <span>Step 1  Confirm project and billing</span>
            )}
          </div>
        </div>
      )}

      {/* Main Step Content */}
      <div className="flex flex-1 flex-col justify-center px-1">
        <AnimatePresence mode="wait">
          {/* STEP 0: INTRO ("What does publishing look like?") */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="mb-6 text-[18px] font-medium text-[#fcfcfc]">
                What does publishing look like?
              </h2>

              {/* Glowing Aura Preview Card */}
              <div className="relative mb-8 w-full max-w-[340px]">
                {/* Rainbow/Neon Glow Border */}
                <div
                  className="absolute -inset-1 rounded-2xl opacity-75 blur-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 30%, #ef4444 60%, #10b981 100%)",
                  }}
                />
                <div className="relative flex h-[180px] flex-col rounded-2xl border border-[#333333] bg-[#1d1d1d] p-3 shadow-2xl">
                  {/* Inner Header Bar */}
                  <div className="flex h-9 w-full items-center justify-center rounded-lg bg-[#282828] text-[13px] font-medium text-[#d4d4d4]">
                    Your app
                  </div>

                  {/* Wireframe Body Graphic */}
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a2a2a] text-[#8c8c8c]">
                      <Globe className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-2 w-16 rounded-full bg-[#383838]" />
                      <div className="h-1.5 w-28 rounded-full bg-[#2a2a2a]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature bullet list */}
              <div className="mb-8 flex flex-col gap-4 text-left text-[14px]">
                <div className="flex items-center gap-3 text-[#d4d4d4]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center text-[#8ab4f8]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <span>Chat history &amp; code will stay private</span>
                </div>
                <div className="flex items-center gap-3 text-[#d4d4d4]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center text-[#8ab4f8]">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <span>Your app will be accessible via a public URL</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 w-full rounded-xl bg-[#2e2e2e] text-[14px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#3d3d3d] active:scale-[0.99]"
              >
                Get started
              </button>
            </motion.div>
          )}

          {/* STEP 1: CONFIRM PROJECT AND BILLING */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              {/* Google Cloud Orb Graphic */}
              <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full opacity-60 blur-xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(66,133,244,0.4) 0%, rgba(234,67,53,0.3) 50%, rgba(52,168,83,0.2) 100%)",
                  }}
                />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#333333] bg-[#1d1d1d] shadow-2xl">
                  {/* Google Cloud SVG Icon */}
                  <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
                      fill="url(#gcp-gradient)"
                    />
                    <defs>
                      <linearGradient id="gcp-gradient" x1="0" y1="4" x2="24" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4285F4" />
                        <stop offset="0.33" stopColor="#EA4335" />
                        <stop offset="0.66" stopColor="#FBBC05" />
                        <stop offset="1" stopColor="#34A853" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Headline */}
              <h3 className="mb-8 max-w-[320px] text-[15px] font-normal leading-relaxed text-[#e5e2e1]">
                Confirm Google Cloud Project where your published app will be stored
              </h3>

              {/* Project selector dropdown container */}
              <div className="relative mb-10 w-full">
                <div
                  onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
                  className="flex h-14 w-full cursor-pointer items-center justify-between rounded-xl border border-[#333333] bg-[#222222] px-3.5 transition-colors hover:border-[#444444]"
                >
                  <div className="flex items-center gap-3">
                    {/* Small GCP icon */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2c2c2c]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
                          fill="url(#gcp-gradient-sm)"
                        />
                        <defs>
                          <linearGradient id="gcp-gradient-sm" x1="0" y1="4" x2="24" y2="20" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4285F4" />
                            <stop offset="0.33" stopColor="#EA4335" />
                            <stop offset="0.66" stopColor="#FBBC05" />
                            <stop offset="1" stopColor="#34A853" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[14px] font-medium text-[#fcfcfc]">{selectedProject}</span>
                      <span className="flex items-center gap-1 text-[12px] text-[#9a9a9a]">
                        My billing account
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1e4620] text-[#4ade80]">
                          ✓
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#9a9a9a]">
                    <ChevronDown className="h-4 w-4" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open("https://console.cloud.google.com", "_blank");
                      }}
                      className="p-1 hover:text-[#fcfcfc]"
                      aria-label="Open GCP console"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isProjectDropdownOpen && (
                  <div className="absolute left-0 top-16 z-50 w-full rounded-xl border border-[#383838] bg-[#222222] p-1.5 shadow-2xl">
                    {["Vinocour AIS", "Production Project (dogfood)", "Personal Workspace"].map((proj) => (
                      <button
                        key={proj}
                        type="button"
                        onClick={() => {
                          setSelectedProject(proj);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] ${
                          selectedProject === proj
                            ? "bg-[#2d2d2d] text-[#fcfcfc]"
                            : "text-[#c4c7c7] hover:bg-[#282828]"
                        }`}
                      >
                        <span>{proj}</span>
                        {selectedProject === proj && <Check className="h-3.5 w-3.5 text-[#8ab4f8]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 w-full rounded-xl bg-[#2e2e2e] text-[14px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#3d3d3d] active:scale-[0.99]"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 2: CONTROL GEMINI API USAGE */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              {/* Gemini Star Graphic */}
              <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full opacity-60 blur-xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(138,180,248,0.5) 0%, rgba(66,133,244,0.2) 60%, transparent 100%)",
                  }}
                />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#333333] bg-[#1d1d1d] shadow-2xl">
                  {/* Gemini 4-point Star */}
                  <svg className="h-10 w-10 text-[#8ab4f8]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
                  </svg>
                </div>
              </div>

              <h3 className="mb-3 text-[16px] font-medium text-[#fcfcfc]">
                Control Gemini API usage
              </h3>

              <p className="mb-8 max-w-[340px] text-[13.5px] leading-relaxed text-[#9a9a9a]">
                You can control your Gemini API usage by setting a spend cap on {selectedProject}. Usage will stop once spend cap is reached.
              </p>

              {/* Spend Cap Configured Badge if set */}
              {spendCapSet && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#1e3a29] px-3 py-1.5 text-[13px] text-[#4ade80]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Spend cap set at ${spendCapAmount} / month</span>
                </div>
              )}

              {/* Set spend cap / Skip actions */}
              <div className="flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowSpendCapModal(true)}
                  className="h-11 w-full rounded-xl bg-[#2e2e2e] text-[14px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#3d3d3d] active:scale-[0.99]"
                >
                  {spendCapSet ? "Change spend cap" : "Set spend cap"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="py-1 text-[13.5px] text-[#9a9a9a] transition-colors hover:text-[#fcfcfc]"
                >
                  {spendCapSet ? "Continue" : "Skip"}
                </button>
              </div>

              {/* Spend Cap Inline Modal */}
              {showSpendCapModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm rounded-2xl border border-[#333333] bg-[#222222] p-5 text-left shadow-2xl"
                  >
                    <h4 className="mb-2 text-[15px] font-semibold text-[#fcfcfc]">
                      Set Gemini API Monthly Spend Cap
                    </h4>
                    <p className="mb-4 text-[13px] text-[#9a9a9a]">
                      Define the maximum USD amount your published app can incur per month.
                    </p>

                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#383838] bg-[#1a1a1a] px-3 py-2.5">
                      <DollarSign className="h-4 w-4 text-[#8ab4f8]" />
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={spendCapAmount}
                        onChange={(e) => setSpendCapAmount(e.target.value)}
                        className="w-full bg-transparent text-[15px] text-[#fcfcfc] outline-none"
                      />
                      <span className="text-[13px] text-[#888]">USD/mo</span>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSpendCapModal(false)}
                        className="rounded-lg px-3 py-1.5 text-[13px] text-[#9a9a9a] hover:text-[#fcfcfc]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSpendCapSet(true);
                          setShowSpendCapModal(false);
                          setStep(3);
                        }}
                        className="rounded-lg bg-[#8ab4f8] px-4 py-1.5 text-[13px] font-medium text-[#191919] hover:bg-[#a8c7fa]"
                      >
                        Save &amp; Continue
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: FINAL TOUCHES */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col text-left"
            >
              {/* Glowing Aura Preview Card with Adaptable App Details */}
              <div className="relative mb-6 w-full">
                <div
                  className="absolute -inset-0.5 rounded-2xl opacity-75 blur-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 30%, #ef4444 60%, #10b981 100%)",
                  }}
                />
                <div className="relative flex flex-col gap-2 rounded-2xl border border-[#333333] bg-[#1d1d1d] p-5 shadow-2xl">
                  {/* Top app badge + title */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a73e8] text-white">
                      {isTodo ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : isSonora ? (
                        <BookOpen className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-[13px] font-medium text-[#c4c7c7]">{appTitle}</span>
                  </div>

                  <h3 className="text-[18px] font-semibold text-[#fcfcfc]">{appTitle}</h3>
                  <p className="text-[13px] text-[#9a9a9a]">{defaultSubtitle}</p>
                </div>
              </div>

              {/* Description Input */}
              <div className="mb-4 flex flex-col gap-2">
                <label htmlFor="publish-description" className="text-[13px] text-[#9a9a9a]">
                  Description
                </label>
                <textarea
                  id="publish-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#333333] bg-[#222222] p-3 text-[13.5px] leading-relaxed text-[#e5e2e1] outline-none transition-colors focus:border-[#8ab4f8]"
                />
              </div>

              {/* App URL Input */}
              <div className="mb-8 flex flex-col gap-2">
                <label htmlFor="publish-app-url" className="text-[13px] text-[#9a9a9a]">
                  App URL
                </label>
                <div className="flex h-11 items-center rounded-xl border border-[#333333] bg-[#222222] px-3.5 focus-within:border-[#8ab4f8]">
                  <input
                    id="publish-app-url"
                    type="text"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 bg-transparent text-[14px] text-[#fcfcfc] outline-none"
                    placeholder="my-app"
                  />
                  <span className="text-[13.5px] text-[#777777]">.ai.studio</span>
                </div>
              </div>

              {/* Publish Button */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2e2e2e] text-[14px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#3d3d3d] active:scale-[0.99] disabled:opacity-60"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#8ab4f8]" />
                    <span>Publishing container...</span>
                  </>
                ) : (
                  <span>Publish your app</span>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 4: PUBLISHED SUCCESS / FINAL PUBLISH SCREEN */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col select-none"
            >
              {/* Aurora & Icon Hero Header with Authentic Rainbow & Dome Arc */}
              <div className="relative -mx-5 -mt-6 h-[190px] overflow-hidden">
                {/* Rainbow Nebula Backdrop */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(ellipse 50% 80% at 10% 25%, #1d4ed8 0%, rgba(29, 78, 216, 0.4) 55%, transparent 75%),
                      radial-gradient(ellipse 45% 75% at 30% 18%, #9333ea 0%, rgba(147, 51, 234, 0.5) 50%, transparent 70%),
                      radial-gradient(ellipse 40% 70% at 50% 12%, #ea580c 0%, rgba(234, 88, 12, 0.55) 45%, transparent 65%),
                      radial-gradient(ellipse 45% 75% at 72% 20%, #16a34a 0%, #0d9488 40%, transparent 70%),
                      radial-gradient(ellipse 50% 80% at 90% 28%, #0284c7 0%, rgba(2, 132, 199, 0.4) 50%, transparent 75%),
                      linear-gradient(180deg, #090d16 0%, #13111c 45%, #191919 100%)
                    `,
                    filter: "blur(14px)",
                    transform: "scale(1.1)",
                  }}
                />

                {/* SVG Dome Arc Horizon */}
                <svg
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-[105px] w-full"
                  viewBox="0 0 500 105"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0,68 Q 250,-12 500,68 L 500,105 L 0,105 Z"
                    className="fill-[#191919]"
                  />
                </svg>

                {/* Floating Centered App Icon */}
                <div className="absolute inset-x-0 bottom-3 flex justify-center">
                  <div className="flex h-[84px] w-[84px] items-center justify-center rounded-[22px] border border-[#2e2e2e] bg-[#242424] shadow-[0_16px_36px_rgba(0,0,0,0.7)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#38bdf8] shadow-md">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 fill-white translate-x-0.5"
                      >
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="mb-6 text-center text-[18px] font-semibold text-[#fcfcfc]">
                {appTitle} is published!
              </h2>

              {/* Top Action Buttons (Visit & Republish) */}
              <div className="mb-5 flex items-center gap-3">
                <a
                  href={`https://${appUrl}.ai.studio`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#333333] px-4 text-[13.5px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#424242]"
                >
                  <Globe className="h-4 w-4" />
                  <span>Visit</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsPublishing(true);
                    setTimeout(() => setIsPublishing(false), 1200);
                  }}
                  disabled={isPublishing}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#333333] bg-transparent px-4 text-[13.5px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#282828] disabled:opacity-60"
                >
                  <RotateCw className={`h-4 w-4 ${isPublishing ? "animate-spin text-[#8ab4f8]" : ""}`} />
                  <span>{isPublishing ? "Publishing..." : "Republish"}</span>
                </button>
              </div>

              {/* Status & Details Card */}
              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#2a2a2a] bg-[#202020] p-5 text-left">
                {/* Status */}
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-[#8c8c8c]">Status</span>
                  <div className="flex items-center gap-2 text-[14px] text-[#e3e3e3]">
                    <span className="h-2 w-2 rounded-full bg-[#81c995]" />
                    <span>Ready</span>
                  </div>
                </div>

                {/* App URL */}
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-[#8c8c8c]">App URL</span>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`https://${appUrl}.ai.studio`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-[14px] text-[#8ab4f8] hover:underline font-mono"
                    >
                      https://{appUrl}.ai.studio
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      title="Copy App URL"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9aa0a6] hover:bg-[#2e2e2e] hover:text-[#fcfcfc]"
                    >
                      {copiedUrl ? <Check className="h-4 w-4 text-[#81c995]" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Gemini API */}
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] text-[#8c8c8c]">Gemini API</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] text-[#e3e3e3] font-mono">
                      {showApiKey ? "AIzaSyD9-38f...eA-Q" : "API Key ...eA-Q"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowApiKey((prev) => !prev)}
                        title={showApiKey ? "Hide API key" : "Show API key"}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9aa0a6] hover:bg-[#2e2e2e] hover:text-[#fcfcfc]"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyApiKey}
                        title="Copy API key"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9aa0a6] hover:bg-[#2e2e2e] hover:text-[#fcfcfc]"
                      >
                        {copiedApiKey ? <Check className="h-4 w-4 text-[#81c995]" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earn with AdSense Callout */}
              <div
                onClick={onNavigateToEarn}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onNavigateToEarn?.();
                  }
                }}
                className="group mb-6 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#2a2a2a] bg-[#202020] p-4 text-left transition-colors hover:border-[#3d3d3d] hover:bg-[#242424]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#81c995]/25 bg-[#81c995]/10 text-[#81c995]">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#fcfcfc] transition-colors group-hover:text-[#8ab4f8]">
                      Earn with AdSense
                    </span>
                    <span className="text-[12.5px] text-[#9a9a9a]">
                      Configure AdSense ads to monetize your live app
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2a2a2a] px-2.5 py-1.5 text-[12px] font-medium text-[#d4d4d4] transition-colors group-hover:bg-[#383838] group-hover:text-[#fcfcfc]">
                  <span>Configure</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#9a9a9a] transition-transform group-hover:translate-x-0.5 group-hover:text-[#fcfcfc]" />
                </div>
              </div>

              {/* Bottom Action Buttons (Advanced settings & Unpublish app) */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[#333333] bg-transparent text-[13.5px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#282828]"
                >
                  Advanced settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                  }}
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-[#333333] bg-[#2a2a2a] text-[13.5px] font-medium text-[#fcfcfc] transition-colors hover:bg-[#383838]"
                >
                  Unpublish app
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
