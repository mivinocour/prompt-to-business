"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MsIcon } from "./icon";
import { PublishFlow } from "./publish-flow";

const TABS = [
  "Chat",
  "Share",
  "Publish",
  "Analytics",
  "Earn",
  "Versions",
  "GitHub",
  "Integrations",
  "Secrets",
] as const;
export type SettingsTab = (typeof TABS)[number];

function TabPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-8 shrink-0 items-center rounded-xl border text-[14px] font-medium transition-colors ${
        active
          ? "border-[#333333] bg-[#2a2a2a] pl-[26px] pr-3 text-[#fcfcfc]"
          : "border-transparent px-3 text-[#d4d4d4] hover:border-[#333333] hover:bg-[#323232] hover:text-[#fcfcfc]"
      }`}
    >
      {active && <span className="absolute left-3 h-[7px] w-[7px] rounded-full bg-[#fcfcfc]" />}
      {label}
    </button>
  );
}

function SelectRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-[#333333] bg-[#252525] px-4 pr-11 text-[14px] text-[#e5e2e1] outline-none transition-colors hover:bg-[#2a2a2a] focus:border-[#8ab4f8]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <MsIcon
        name="keyboard_arrow_down"
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]"
      />
    </label>
  );
}

function ChatSettings() {
  const [model, setModel] = useState("Default (Gemini 3.5 Flash)");
  const [microphone, setMicrophone] = useState("Default");
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[16px] font-medium text-[#c4c7c7]">Chat settings</h2>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#8c8c8c]">Select model to use in Chat</span>
        <SelectRow
          label="Chat model"
          value={model}
          onChange={setModel}
          options={[
            "Default (Gemini 3.5 Flash)",
            "Gemini 3.1 Pro Preview",
            "Gemini 3 Flash Preview",
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#8c8c8c]">System instructions</span>
        <button
          onClick={() => setShowInstructions((visible) => !visible)}
          className="rounded-xl border border-[#333333] bg-[#252525] px-4 py-4 text-left transition-colors hover:bg-[#2a2a2a]"
        >
          <span className="block text-[14px] text-[#d4d4d4]">Custom instructions</span>
          <span className="mt-1 block text-[13px] leading-[1.5] text-[#8c8c8c]">
            Add custom instructions for your app — personality, specific knowledge, and more
          </span>
        </button>
        {showInstructions && (
          <textarea
            aria-label="Custom system instructions"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Describe how your app should behave..."
            rows={5}
            className="resize-none rounded-xl border border-[#333333] bg-[#202020] px-4 py-3 text-[14px] leading-6 text-[#e5e2e1] outline-none focus:border-[#8ab4f8]"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#8c8c8c]">Usage</span>
        <div className="rounded-xl border border-[#8ab4f8] px-4 py-4">
          <span className="inline-flex items-center rounded-md bg-[#2a2a2a] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#c2e7ff]">
            ULTRA
          </span>
          <p className="mt-2 text-[14px] leading-[1.5] text-[#d4d4d4]">
            You&apos;re currently using your Google AI Ultra plan for chat.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#8c8c8c]">Microphone source</span>
        <SelectRow
          label="Microphone source"
          value={microphone}
          onChange={setMicrophone}
          options={["Default", "System microphone", "No microphone"]}
        />
      </div>
    </div>
  );
}

function ShareSettings({ appTitle = "Todo List" }: { appTitle?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://aistudio.google.com/apps/${appTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "app"}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div>
        <h2 className="text-[16px] font-medium text-[#fcfcfc]">Share {appTitle}</h2>
        <p className="mt-1 text-[13px] text-[#8c8c8c]">
          Share this interactive applet with teammates, testers, or the public.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#c4c7c7]">Public Web Link</span>
        <div className="flex items-center gap-2 rounded-xl border border-[#333333] bg-[#222222] p-2 pl-3">
          <span className="flex-1 truncate text-[13px] text-[#9aa0a6] font-mono">
            {shareUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#3a3a3a] bg-[#2e2e2e] px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-[#3d3d3d]"
          >
            <MsIcon name={copied ? "check" : "content_copy"} size={14} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#333333] bg-[#222222] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2e2e2e] text-[#8ab4f8]">
              <MsIcon name="public" size={18} />
            </div>
            <div>
              <div className="text-[13.5px] font-medium text-white">Anyone with the link</div>
              <div className="text-[12px] text-[#888]">Can view and interact with the application</div>
            </div>
          </div>
          <span className="rounded-full bg-[#183424] border border-[#235839] px-2.5 py-0.5 text-[11px] font-medium text-[#81c995]">
            Active
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#c4c7c7]">Embed on Website</span>
        <div className="rounded-xl border border-[#333333] bg-[#1e1e1e] p-3 text-[12px] font-mono text-[#aaa]">
          {`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`}
        </div>
      </div>
    </div>
  );
}

function AnalyticsSettings({ appTitle = "Todo List" }: { appTitle?: string }) {
  const [timeframe, setTimeframe] = useState<"Day" | "Week" | "Month">("Week");
  const [copied, setCopied] = useState(false);

  const TIMEFRAME_DATA = {
    Day: {
      activeUsers: 482,
      trendPct: 12.4,
      avgSession: "3m 48s",
      pageViews: 1940,
      bounceRate: "22.1%",
      chartBars: [
        { label: "12am", value: 18 },
        { label: "4am", value: 8 },
        { label: "8am", value: 45 },
        { label: "12pm", value: 88 },
        { label: "4pm", value: 120 },
        { label: "8pm", value: 95 },
        { label: "11pm", value: 42 },
      ],
    },
    Week: {
      activeUsers: 3420,
      trendPct: 24.8,
      avgSession: "4m 32s",
      pageViews: 14200,
      bounceRate: "24.8%",
      chartBars: [
        { label: "Mon", value: 380 },
        { label: "Tue", value: 490 },
        { label: "Wed", value: 620 },
        { label: "Thu", value: 540 },
        { label: "Fri", value: 710 },
        { label: "Sat", value: 840 },
        { label: "Sun", value: 680 },
      ],
    },
    Month: {
      activeUsers: 14890,
      trendPct: 38.5,
      avgSession: "5m 12s",
      pageViews: 68400,
      bounceRate: "21.4%",
      chartBars: [
        { label: "W1", value: 2900 },
        { label: "W2", value: 3600 },
        { label: "W3", value: 4400 },
        { label: "W4", value: 5200 },
      ],
    },
  };

  const data = TIMEFRAME_DATA[timeframe];
  const maxValue = Math.max(...data.chartBars.map((b) => b.value));

  const handleExport = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#81c995] animate-pulse" />
            <h2 className="text-[16px] font-medium text-[#fcfcfc]">Analytics & Insights</h2>
          </div>
          <p className="mt-1 text-[13px] text-[#8c8c8c]">
            Real-time traffic, engagement, and audience demographics for {appTitle}.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center rounded-xl bg-[#252525] p-1 border border-[#333333]">
          {(["Day", "Week", "Month"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-[12px] font-medium rounded-lg transition-colors ${
                timeframe === tf
                  ? "bg-[#333333] text-[#fcfcfc] shadow-sm"
                  : "text-[#8c8c8c] hover:text-[#e5e2e1]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active Users */}
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px]">
            <span>Active Users</span>
            <MsIcon name="group" size={16} className="text-[#8ab4f8]" />
          </div>
          <div className="my-2 text-[26px] font-semibold tracking-tight text-[#fcfcfc]">
            {data.activeUsers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span
              className={`inline-flex items-center font-medium ${
                data.trendPct >= 0 ? "text-[#81c995]" : "text-[#f28b82]"
              }`}
            >
              {data.trendPct >= 0 ? "↗ +" : "↘ "}
              {data.trendPct}%
            </span>
            <span className="text-[#777]">vs last {timeframe.toLowerCase()}</span>
          </div>
        </div>

        {/* Page Views */}
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px]">
            <span>Page Views</span>
            <MsIcon name="visibility" size={16} className="text-[#c2e7ff]" />
          </div>
          <div className="my-2 text-[26px] font-semibold tracking-tight text-[#fcfcfc]">
            {data.pageViews.toLocaleString()}
          </div>
          <div className="text-[12px] text-[#777]">Est. impressions logged</div>
        </div>

        {/* Avg Session Duration */}
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px]">
            <span>Avg. Session</span>
            <MsIcon name="schedule" size={16} className="text-[#fdd663]" />
          </div>
          <div className="my-2 text-[26px] font-semibold tracking-tight text-[#fcfcfc]">
            {data.avgSession}
          </div>
          <div className="text-[12px] text-[#777]">Time per active visitor</div>
        </div>

        {/* Bounce Rate */}
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px]">
            <span>Bounce Rate</span>
            <MsIcon name="trending_down" size={16} className="text-[#9aa0a6]" />
          </div>
          <div className="my-2 text-[26px] font-semibold tracking-tight text-[#fcfcfc]">
            {data.bounceRate}
          </div>
          <div className="text-[12px] text-[#81c995]">Healthy interaction rate</div>
        </div>
      </div>

      {/* Interactive Activity Chart */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#e3e3e3]">Traffic & User Activity</span>
          <span className="text-[11.5px] text-[#777]">Measured across {timeframe.toLowerCase()}</span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="pt-4 pb-2">
          <div className="flex h-32 items-end justify-between gap-2 px-1">
            {data.chartBars.map((bar) => {
              const heightPct = Math.round((bar.value / maxValue) * 100);
              return (
                <div
                  key={bar.label}
                  className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end"
                >
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#333333] text-white text-[10px] font-medium py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap shadow-md z-10">
                    {bar.value.toLocaleString()} users
                  </div>
                  <div
                    style={{ height: `${Math.max(12, heightPct)}%` }}
                    className="w-full rounded-t-md bg-[#385072] group-hover:bg-[#8ab4f8] transition-all"
                  />
                  <span className="text-[11px] text-[#888] font-normal">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Acquisition Channels */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#e3e3e3]">Top Acquisition Channels</span>
          <span className="text-[11.5px] text-[#777]">Referral Breakdown</span>
        </div>

        <div className="space-y-2.5 pt-1">
          {[
            { channel: "Direct / Applet Link", pct: 48, color: "bg-[#8ab4f8]" },
            { channel: "Google Search", pct: 32, color: "bg-[#81c995]" },
            { channel: "Social & Shared Links", pct: 14, color: "bg-[#fdd663]" },
            { channel: "Referrals & Embeds", pct: 6, color: "bg-[#f28b82]" },
          ].map((item) => (
            <div key={item.channel} className="space-y-1">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#bbb]">{item.channel}</span>
                <span className="font-medium text-[#fcfcfc]">{item.pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#191919] overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device & Geography Split */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-3.5 flex flex-col justify-between">
          <span className="text-[12.5px] font-medium text-[#e3e3e3]">Device Distribution</span>
          <div className="my-2 space-y-1 text-[12px]">
            <div className="flex justify-between text-[#ccc]">
              <span>📱 Mobile</span>
              <span className="font-semibold text-white">68%</span>
            </div>
            <div className="flex justify-between text-[#ccc]">
              <span>💻 Desktop</span>
              <span className="font-semibold text-white">32%</span>
            </div>
          </div>
          <span className="text-[11px] text-[#777]">iOS 45% • Android 23% • Mac 20%</span>
        </div>

        <div className="rounded-xl border border-[#333333] bg-[#222222] p-3.5 flex flex-col justify-between">
          <span className="text-[12.5px] font-medium text-[#e3e3e3]">Top Countries</span>
          <div className="my-2 space-y-1 text-[12px]">
            <div className="flex justify-between text-[#ccc]">
              <span>🇺🇸 United States</span>
              <span className="font-semibold text-white">44%</span>
            </div>
            <div className="flex justify-between text-[#ccc]">
              <span>🇯🇵 Japan</span>
              <span className="font-semibold text-white">18%</span>
            </div>
          </div>
          <span className="text-[11px] text-[#777]">Germany 14% • UK 9% • Others 15%</span>
        </div>
      </div>

      {/* Export Action */}
      <div className="flex items-center justify-between rounded-xl border border-[#333333] bg-[#252525] p-3.5">
        <div>
          <div className="text-[13px] font-medium text-[#fcfcfc]">Export Analytics Data</div>
          <div className="text-[12px] text-[#8c8c8c]">Download CSV report with full telemetry</div>
        </div>
        <button
          onClick={handleExport}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[#444] bg-[#333] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#444]"
        >
          <MsIcon name={copied ? "check" : "download"} size={14} />
          {copied ? "Exported!" : "Export CSV"}
        </button>
      </div>
    </div>
  );
}

function EarnSettings({ appTitle = "Todo List" }: { appTitle?: string }) {
  const [autoAds, setAutoAds] = useState(true);
  const [rewardedAds, setRewardedAds] = useState(false);
  const [anchorAds, setAnchorAds] = useState(true);
  const [adBlockerRecovery, setAdBlockerRecovery] = useState(true);
  const [copiedPubId, setCopiedPubId] = useState(false);

  const publisherId = "pub-842910384729104";

  const handleCopyPubId = () => {
    navigator.clipboard?.writeText?.(publisherId);
    setCopiedPubId(true);
    setTimeout(() => setCopiedPubId(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#133824] text-[#81c995]">
            <MsIcon name="attach_money" size={16} />
          </div>
          <h2 className="text-[16px] font-medium text-[#fcfcfc]">Earn & Monetization</h2>
        </div>
        <p className="mt-1 text-[13px] text-[#8c8c8c]">
          Monetize your app traffic with Google AdSense and manage payouts for {appTitle}.
        </p>
      </div>

      {/* Revenue & Payout Progress Banner */}
      <div className="rounded-xl border border-[#235839] bg-[#14261d] p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-medium text-[#a3d9b4]">Estimated Earnings (This Month)</span>
          <span className="rounded-full bg-[#1d4830] border border-[#2d6b47] px-2.5 py-0.5 text-[11px] font-semibold text-[#81c995]">
            RPM $18.40
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-bold tracking-tight text-white">$184.20</span>
          <span className="text-[12.5px] text-[#81c995] font-medium">↗ +28.5% vs last month</span>
        </div>

        {/* Progress towards $100 payout threshold */}
        <div className="space-y-1.5 pt-1 border-t border-[#1e442f]">
          <div className="flex justify-between text-[11.5px] text-[#a3d9b4]">
            <span>Next Payout Threshold ($100.00)</span>
            <span className="font-semibold text-white">$84.20 of $100.00 (84%)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#102419] overflow-hidden">
            <div className="h-full bg-[#81c995] rounded-full transition-all" style={{ width: "84%" }} />
          </div>
          <span className="text-[11px] text-[#719e83] block">Scheduled payout date: 21st of next month</span>
        </div>
      </div>

      {/* AdSense Account Status */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a73e8] text-white">
              <MsIcon name="attach_money" size={18} />
            </div>
            <div>
              <div className="text-[13.5px] font-medium text-white">Google AdSense Status</div>
              <div className="text-[12px] text-[#888]">Linked to your Google publisher account</div>
            </div>
          </div>
          <span className="rounded-full bg-[#133824] border border-[#215a3a] px-2.5 py-0.5 text-[11px] font-semibold text-[#81c995]">
            Verified Eligible
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] p-2.5 px-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#888]">Publisher ID:</span>
            <span className="text-[12.5px] font-mono text-[#d4d4d4]">{publisherId}</span>
          </div>
          <button
            onClick={handleCopyPubId}
            className="flex items-center gap-1 text-[11.5px] text-[#8ab4f8] hover:text-[#aecbfa]"
          >
            <MsIcon name={copiedPubId ? "check" : "content_copy"} size={13} />
            {copiedPubId ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Ad Placements & Controls */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 flex flex-col gap-3">
        <span className="text-[13.5px] font-medium text-white">Ad Formats & Placements</span>

        <div className="divide-y divide-[#2a2a2a] pt-1">
          {/* Auto-Ads */}
          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <div>
              <div className="text-[13px] font-medium text-[#e3e3e3]">Auto-Ads Placements</div>
              <div className="text-[11.5px] text-[#888]">
                Automatically place unobtrusive, responsive banner ads
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoAds}
              onChange={(e) => setAutoAds(e.target.checked)}
              className="h-4 w-4 rounded accent-[#8ab4f8] cursor-pointer"
            />
          </label>

          {/* Anchor Ads */}
          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <div>
              <div className="text-[13px] font-medium text-[#e3e3e3]">Mobile Anchor Ads</div>
              <div className="text-[11.5px] text-[#888]">
                Sticky bottom banners optimized for mobile touchscreens
              </div>
            </div>
            <input
              type="checkbox"
              checked={anchorAds}
              onChange={(e) => setAnchorAds(e.target.checked)}
              className="h-4 w-4 rounded accent-[#8ab4f8] cursor-pointer"
            />
          </label>

          {/* Rewarded Ads */}
          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <div>
              <div className="text-[13px] font-medium text-[#e3e3e3]">Rewarded Feature Unlock Ads</div>
              <div className="text-[11.5px] text-[#888]">
                Allow users to opt into a 15s ad to unlock premium features
              </div>
            </div>
            <input
              type="checkbox"
              checked={rewardedAds}
              onChange={(e) => setRewardedAds(e.target.checked)}
              className="h-4 w-4 rounded accent-[#8ab4f8] cursor-pointer"
            />
          </label>

          {/* Ad Blocker Recovery */}
          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <div>
              <div className="text-[13px] font-medium text-[#e3e3e3]">Ad Blocker Recovery Message</div>
              <div className="text-[11.5px] text-[#888]">
                Politely request visitors to allow ads to support development
              </div>
            </div>
            <input
              type="checkbox"
              checked={adBlockerRecovery}
              onChange={(e) => setAdBlockerRecovery(e.target.checked)}
              className="h-4 w-4 rounded accent-[#8ab4f8] cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Monetization Metrics Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-[12px]">
        <div className="p-3 rounded-xl bg-[#222222] border border-[#333333]">
          <div className="text-[#888] mb-1">Ad Impressions</div>
          <div className="text-[18px] font-bold text-white">14,200</div>
          <span className="text-[11px] text-[#81c995] font-medium">98.2% fill rate</span>
        </div>
        <div className="p-3 rounded-xl bg-[#222222] border border-[#333333]">
          <div className="text-[#888] mb-1">Total Clicks</div>
          <div className="text-[18px] font-bold text-white">482</div>
          <span className="text-[11px] text-[#8ab4f8] font-medium">3.4% CTR</span>
        </div>
        <div className="p-3 rounded-xl bg-[#222222] border border-[#333333]">
          <div className="text-[#888] mb-1">Average RPM</div>
          <div className="text-[18px] font-bold text-white">$18.40</div>
          <span className="text-[11px] text-[#81c995] font-medium">+14% vs avg</span>
        </div>
      </div>
    </div>
  );
}

export function SettingsDrawer({
  open,
  onClose,
  initialTab = "Chat",
  appTitle = "Todo List",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  appTitle?: string;
}) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
        style={{ background: "rgba(25, 25, 25, 0.3)", backdropFilter: "blur(2px)" }}
        aria-hidden={!open}
      />
      <motion.div
        initial={false}
        animate={{ x: open ? "0%" : "100%" }}
        transition={{ type: "tween", duration: 0.25, ease: [0.2, 0, 0, 1] }}
        className={`fixed right-0 top-0 z-50 flex h-full w-[550px] max-w-[92vw] flex-col border-l border-[#333333] bg-[#191919] ${
          open ? "" : "pointer-events-none"
        }`}
        role={open ? "dialog" : undefined}
        aria-label="App settings"
        aria-hidden={!open}
      >
        {/* Tab bar */}
        <div className="flex h-16 shrink-0 items-center gap-1.5 px-3">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {TABS.map((t) => (
              <TabPill key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
            ))}
          </div>
          <button
            aria-label="Close settings"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#d4d4d4] transition-colors hover:bg-[#3a3a3a] hover:text-[#fcfcfc]"
          >
            <MsIcon name="close" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
          {tab === "Chat" ? (
            <ChatSettings />
          ) : tab === "Share" ? (
            <ShareSettings appTitle={appTitle} />
          ) : tab === "Publish" ? (
            <PublishFlow
              appTitle={appTitle}
              onClose={onClose}
              onNavigateToEarn={() => setTab("Earn")}
            />
          ) : tab === "Analytics" ? (
            <AnalyticsSettings appTitle={appTitle} />
          ) : tab === "Earn" ? (
            <EarnSettings appTitle={appTitle} />
          ) : (
            <div className="flex flex-col gap-3">
              <h2 className="text-[16px] font-medium text-[#c4c7c7]">{tab} settings</h2>
              <p className="text-[14px] text-[#8c8c8c]">
                {tab} settings aren&apos;t part of this prototype yet.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
