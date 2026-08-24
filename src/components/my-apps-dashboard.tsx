"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MsIcon } from "@/components/ui/ms-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type Timeframe = "Day" | "Week" | "Month";
export type TabFilter = "by_you" | "recents" | "by_others";

export interface MetricData {
  activeUsers: number;
  trendPct: number;
  uniqueUsers: number;
  pageViews: number;
  adSensePotential?: number;
  estRev?: number;
  rpm?: number;
  impressions?: number;
  ctr?: number;
  nextPayoutDate?: string;
}

export interface AppItem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor?: string;
  hasDropdown: boolean;
  hasAdsense: boolean;
  updatedText: string;
  createdText: string;
  category: TabFilter;
  metrics?: {
    Day: MetricData;
    Week: MetricData;
    Month: MetricData;
  };
}

const APPS_DATA: AppItem[] = [
  {
    id: "app-1",
    name: "Remix [Template] AIS Playground + Build",
    subtitle: "Imported from GitHub: ammaarreshi/ais-prototype",
    icon: "sports_esports",
    iconBg: "#1a73e8",
    hasDropdown: false,
    hasAdsense: false, // None (no dropdown)
    updatedText: "0 minutes ago",
    createdText: "Created 14 minutes ago",
    category: "by_you",
  },
  {
    id: "app-2",
    name: "Sonora",
    subtitle: "Mobile audible bookshelf",
    icon: "smartphone",
    iconBg: "#1a73e8",
    hasDropdown: true,
    hasAdsense: true, // AdSense Active (configured)
    updatedText: "2 hours ago",
    createdText: "Created 6 days ago",
    category: "by_you",
    metrics: {
      Day: {
        activeUsers: 310,
        trendPct: 1.2,
        uniqueUsers: 280,
        pageViews: 840,
        estRev: 8.5,
        rpm: 16.2,
        impressions: 524,
        ctr: 2.7,
        nextPayoutDate: "Sep 21",
      },
      Week: {
        activeUsers: 1840,
        trendPct: 2.4,
        uniqueUsers: 1420,
        pageViews: 4260,
        estRev: 49.2,
        rpm: 16.5,
        impressions: 2982,
        ctr: 2.8,
        nextPayoutDate: "Sep 21",
      },
      Month: {
        activeUsers: 7920,
        trendPct: 4.8,
        uniqueUsers: 5980,
        pageViews: 18400,
        estRev: 218.4,
        rpm: 16.8,
        impressions: 12960,
        ctr: 2.9,
        nextPayoutDate: "Sep 21",
      },
    },
  },
  {
    id: "app-3",
    name: "Beli for Books",
    subtitle:
      "A social book rating and ranking app featuring Beli's iconic pairwise comparisons, personalized 0-10 leaderboa...",
    icon: "menu_book",
    iconBg: "#00875a",
    hasDropdown: true,
    hasAdsense: false, // Analytics ONLY (AdSense not set up yet - shows setup callout)
    updatedText: "23 hours ago",
    createdText: "Created 7 days ago",
    category: "by_you",
    metrics: {
      Day: {
        activeUsers: 524,
        trendPct: 5.2,
        uniqueUsers: 690,
        pageViews: 2410,
        adSensePotential: 48.5,
      },
      Week: {
        activeUsers: 3492,
        trendPct: 14.8,
        uniqueUsers: 4850,
        pageViews: 18430,
        adSensePotential: 339.11,
      },
      Month: {
        activeUsers: 14280,
        trendPct: 22.1,
        uniqueUsers: 19840,
        pageViews: 74600,
        adSensePotential: 1420.8,
      },
    },
  },
  {
    id: "app-4",
    name: "Haute Couture Runway & Veo Generator",
    subtitle:
      "Interactive haute couture runway visualizer and Veo video generator powered by Google GenAI.",
    icon: "spark",
    iconBg: "#d9387a",
    hasDropdown: true,
    hasAdsense: false, // Analytics ONLY (AdSense not set up yet)
    updatedText: "7 days ago",
    createdText: "Created 7 days ago",
    category: "by_you",
    metrics: {
      Day: {
        activeUsers: 140,
        trendPct: -4.1,
        uniqueUsers: 210,
        pageViews: 780,
        adSensePotential: 12.0,
      },
      Week: {
        activeUsers: 892,
        trendPct: -16.2,
        uniqueUsers: 1240,
        pageViews: 4520,
        adSensePotential: 88.5,
      },
      Month: {
        activeUsers: 4120,
        trendPct: -8.5,
        uniqueUsers: 5600,
        pageViews: 21300,
        adSensePotential: 380.0,
      },
    },
  },
  {
    id: "app-5",
    name: "Atelier High Fashion Runway",
    subtitle:
      "An interactive 3D high fashion runway world model featuring procedural catwalk simulations, haute couture gar...",
    icon: "music_note",
    iconBg: "#9c27b0",
    hasDropdown: false,
    hasAdsense: false, // None
    updatedText: "7 days ago",
    createdText: "Created 7 days ago",
    category: "by_you",
  },
  {
    id: "app-6",
    name: "INFINITE ATELIER",
    subtitle:
      "AAA agentic world model and high-end fashion management simulation video game powered by Gemini 3.7 Fla...",
    icon: "calendar_today",
    iconBg: "#0097a7",
    hasDropdown: true,
    hasAdsense: false, // Analytics ONLY
    updatedText: "7 days ago",
    createdText: "Created 7 days ago",
    category: "by_you",
    metrics: {
      Day: {
        activeUsers: 85,
        trendPct: -7.2,
        uniqueUsers: 130,
        pageViews: 490,
      },
      Week: {
        activeUsers: 540,
        trendPct: -28.4,
        uniqueUsers: 790,
        pageViews: 2890,
      },
      Month: {
        activeUsers: 2840,
        trendPct: -15.1,
        uniqueUsers: 3920,
        pageViews: 14100,
      },
    },
  },
  {
    id: "app-7",
    name: "Diary Entry",
    subtitle:
      "An intimate and thoughtful personal diary application to write, reflect, and preserve daily journal entries.",
    icon: "edit",
    iconBg: "#f57c00",
    hasDropdown: false,
    hasAdsense: false, // None
    updatedText: "7 days ago",
    createdText: "Created 7 days ago",
    category: "by_you",
  },
  {
    id: "app-8",
    name: "CipherDiary - Encrypted Voice Diary",
    subtitle:
      "A private, zero-knowledge daily diary featuring AES-256-GCM encryption, biometric/PIN vault lock, and real-ti...",
    icon: "lock",
    iconBg: "#1976d2",
    hasDropdown: false,
    hasAdsense: false, // None
    updatedText: "7 days ago",
    createdText: "Created 7 days ago",
    category: "by_you",
  },
  {
    id: "app-9",
    name: "Bedtime Diary",
    subtitle:
      "A serene evening diary to log daily activities, night thoughts, and unburden your mind before sleep.",
    icon: "bedtime",
    iconBg: "#f57c00",
    hasDropdown: true,
    hasAdsense: true, // BOTH Analytics & AdSense
    updatedText: "10 days ago",
    createdText: "Created 10 days ago",
    category: "by_you",
    metrics: {
      Day: {
        activeUsers: 62,
        trendPct: -6.0,
        uniqueUsers: 95,
        pageViews: 320,
        estRev: 3.2,
        rpm: 14.1,
        impressions: 226,
        ctr: 2.4,
        nextPayoutDate: "Sep 21",
      },
      Week: {
        activeUsers: 412,
        trendPct: -28.4,
        uniqueUsers: 620,
        pageViews: 1940,
        estRev: 24.8,
        rpm: 15.2,
        impressions: 1630,
        ctr: 2.5,
        nextPayoutDate: "Sep 21",
      },
      Month: {
        activeUsers: 1980,
        trendPct: -18.2,
        uniqueUsers: 2840,
        pageViews: 9200,
        estRev: 118.5,
        rpm: 16.0,
        impressions: 7400,
        ctr: 2.7,
        nextPayoutDate: "Sep 21",
      },
    },
  },
];

export function MyAppsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>("by_you");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  // Expand "app-2" (Sonora) by default as in the screenshot
  const [expandedAppIds, setExpandedAppIds] = useState<Record<string, boolean>>({
    "app-2": true,
  });
  // Timeframe state per app (defaults to "Week")
  const [appTimeframes, setAppTimeframes] = useState<Record<string, Timeframe>>({});

  // Modals state
  const [adSenseModalApp, setAdSenseModalApp] = useState<AppItem | null>(null);
  const [adSenseEnabled, setAdSenseEnabled] = useState(false);
  const [analyticsModalApp, setAnalyticsModalApp] = useState<AppItem | null>(null);

  const toggleExpand = (appId: string) => {
    setExpandedAppIds((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const getTimeframe = (appId: string): Timeframe => {
    return appTimeframes[appId] || "Week";
  };

  const setTimeframe = (appId: string, tf: Timeframe) => {
    setAppTimeframes((prev) => ({
      ...prev,
      [appId]: tf,
    }));
  };

  const filteredApps = useMemo(() => {
    return APPS_DATA.filter((app) => {
      const matchesTab =
        activeTab === "by_you"
          ? true
          : activeTab === "recents"
          ? app.updatedText.includes("minute") || app.updatedText.includes("hour") || app.updatedText.includes("23 hours")
          : app.name.includes("Remix") || app.subtitle.includes("GitHub");

      const matchesSearch =
        searchQuery.trim() === "" ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="flex-1 min-h-screen bg-[#191919] text-[#d4d4d4] overflow-y-auto px-6 py-6 select-none font-sans">
      {/* ─── Top Header ─── */}
      <div className="max-w-[1300px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          {/* Title with icon */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#262626] text-[#e3e3e3]">
              <MsIcon name="auto_stories" size={18} />
            </div>
            <h1 className="text-[22px] font-semibold text-[#fcfcfc] tracking-tight">Apps</h1>
          </div>

          {/* Right Controls: Tabs + View Switcher + Add App + Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-[#202020] border border-[#2c2c2c]">
              <button
                onClick={() => setActiveTab("by_you")}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === "by_you"
                    ? "bg-[#2d2d2d] text-[#fcfcfc] shadow-sm"
                    : "text-[#9a9a9a] hover:text-[#e3e3e3]"
                }`}
              >
                By you
              </button>
              <button
                onClick={() => setActiveTab("recents")}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === "recents"
                    ? "bg-[#2d2d2d] text-[#fcfcfc] shadow-sm"
                    : "text-[#9a9a9a] hover:text-[#e3e3e3]"
                }`}
              >
                Recents
              </button>
              <button
                onClick={() => setActiveTab("by_others")}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === "by_others"
                    ? "bg-[#2d2d2d] text-[#fcfcfc] shadow-sm"
                    : "text-[#9a9a9a] hover:text-[#e3e3e3]"
                }`}
              >
                By others
              </button>
            </div>

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#202020] border border-[#2c2c2c] text-[#a0a0a0] hover:text-[#fcfcfc] hover:bg-[#282828] transition-colors"
              title="Toggle Grid / List"
            >
              <MsIcon name={viewMode === "list" ? "grid_view" : "view_module"} size={16} />
            </button>

            {/* + New App Button */}
            <button
              onClick={() => router.push("/build")}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#202020] border border-[#2c2c2c] text-[#a0a0a0] hover:text-[#fcfcfc] hover:bg-[#282828] transition-colors"
              title="Create new app"
            >
              <MsIcon name="add" size={18} />
            </button>

            {/* Search Input */}
            <div className="relative flex items-center min-w-[200px] sm:min-w-[240px]">
              <span className="absolute left-3 text-[#777]">
                <MsIcon name="search" size={15} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an app"
                className="w-full h-9 pl-9 pr-3 rounded-full bg-[#202020] border border-[#2c2c2c] text-[13px] text-[#e3e3e3] placeholder-[#777] focus:outline-none focus:border-[#444] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-[#888] hover:text-[#eee]"
                >
                  <MsIcon name="close" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Table Header (for List view) ─── */}
        {viewMode === "list" && (
          <div className="flex items-center px-4 py-3.5 mt-2 text-[12px] font-medium text-[#7c7c7c] border-b border-[#242424]">
            <div className="flex-1">Name</div>
            <div className="w-[120px] text-center">Trend</div>
            <div className="w-[160px] text-right flex items-center justify-end gap-1 cursor-pointer hover:text-[#a0a0a0]">
              <span>Updated</span>
              <MsIcon name="arrow_upward_alt" size={14} className="rotate-180" />
            </div>
          </div>
        )}

        {/* ─── App List / Grid ─── */}
        {viewMode === "list" ? (
          <div className="divide-y divide-[#222222]">
            {filteredApps.length === 0 ? (
              <div className="py-16 text-center text-[#777]">
                <p className="text-[14px]">No apps found matching your search.</p>
              </div>
            ) : (
              filteredApps.map((app) => {
                const isExpanded = !!expandedAppIds[app.id];
                const currentTimeframe = getTimeframe(app.id);
                const currentMetric = app.metrics ? app.metrics[currentTimeframe] : null;
                const trendVal = app.metrics?.Week.trendPct;
                const isPositive = trendVal !== undefined && trendVal >= 0;

                return (
                  <div key={app.id} className="group transition-colors">
                    {/* Row Summary */}
                    <div
                      className={`flex items-center px-4 py-3.5 hover:bg-[#1f1f1f] rounded-lg transition-colors cursor-pointer ${
                        isExpanded ? "bg-[#1d1d1d]" : ""
                      }`}
                      onClick={() => {
                        router.push("/build");
                      }}
                    >
                      {/* App Icon + Title + Subtitle */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                        <div
                          className="flex items-center justify-center w-9 h-9 rounded-[10px] text-white shrink-0 shadow-sm transition-transform group-hover:scale-105"
                          style={{ backgroundColor: app.iconBg }}
                        >
                          <MsIcon name={app.icon} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-[#e3e3e3] group-hover:text-[#8ab4f8] transition-colors truncate">
                              {app.name}
                            </span>
                          </div>
                          <p className="text-[12.5px] text-[#7d7d7d] truncate font-normal">
                            {app.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Trend Column */}
                      <div className="w-[120px] flex items-center justify-center shrink-0">
                        {app.hasDropdown && trendVal !== undefined ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(app.id);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-all ${
                              isExpanded
                                ? "bg-[#1d2736] border-[#385072] text-[#8ab4f8]"
                                : "bg-[#232323] border-[#303030] text-[#8ab4f8] hover:bg-[#2c2c2c] hover:border-[#404040]"
                            }`}
                          >
                            <MsIcon
                              name={isPositive ? "trending_up" : "trending_down"}
                              size={13}
                              className={isPositive ? "text-[#8ab4f8]" : "text-[#9aa0a6]"}
                            />
                            <span>
                              {isPositive ? `+${trendVal}%` : `${trendVal}%`}
                            </span>
                            <MsIcon
                              name={isExpanded ? "expand_less" : "expand_more"}
                              size={14}
                              className="text-[#9aa0a6] ml-0.5"
                            />
                          </button>
                        ) : (
                          <span className="text-[#555] text-[14px] font-medium">—</span>
                        )}
                      </div>

                      {/* Updated Column */}
                      <div className="w-[160px] text-right shrink-0">
                        <div className="text-[13px] text-[#d4d4d4] font-medium leading-snug">
                          {app.updatedText}
                        </div>
                        <div className="text-[11.5px] text-[#777] leading-snug">
                          {app.createdText}
                        </div>
                      </div>
                    </div>

                    {/* ─── Expanded Dashboard Panel ─── */}
                    <AnimatePresence>
                      {isExpanded && currentMetric && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mx-4 my-2 p-4 rounded-2xl bg-[#212121] border border-[#2d2d2d] shadow-lg">
                            {/* Card Header: Dot + Title + Timeframe Selector */}
                            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#2a2a2a]">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8ab4f8] shadow-[0_0_8px_#8ab4f8]" />
                                <span className="text-[13px] font-medium text-[#e3e3e3]">
                                  {app.hasAdsense
                                    ? "Traffic & Monetization Overview"
                                    : "Traffic Overview"}
                                </span>
                              </div>

                              {/* Time Period Selector: Day / Week / Month */}
                              <div className="flex items-center p-0.5 rounded-lg bg-[#181818] border border-[#2b2b2b]">
                                {(["Day", "Week", "Month"] as Timeframe[]).map((tf) => (
                                  <button
                                    key={tf}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTimeframe(app.id, tf);
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors ${
                                      currentTimeframe === tf
                                        ? "bg-[#2e2e2e] text-[#fcfcfc] shadow-sm"
                                        : "text-[#888] hover:text-[#ccc]"
                                    }`}
                                  >
                                    {tf}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* ─── Metric Cards Grid ─── */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {app.hasAdsense ? (
                                /* ─── Configured AdSense Monetization View (Unique Users, Est. Rev, Page RPM) ─── */
                                <>
                                  {/* Card 1: Unique Users */}
                                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#303030] flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px] font-medium">
                                      <span>Unique Users</span>
                                      <span className="text-[#8ab4f8]">
                                        <MsIcon name="group" size={16} />
                                      </span>
                                    </div>
                                    <div className="my-2 text-[24px] font-semibold text-[#fcfcfc] tracking-tight">
                                      {currentMetric.uniqueUsers.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#8c8c8c]">
                                      <span
                                        className={`inline-flex items-center gap-0.5 font-medium ${
                                          currentMetric.trendPct >= 0
                                            ? "text-[#81c995]"
                                            : "text-[#f28b82]"
                                        }`}
                                      >
                                        {currentMetric.trendPct >= 0 ? "↗" : "↘"}{" "}
                                        {currentMetric.trendPct >= 0 ? "+" : ""}
                                        {currentMetric.trendPct}%
                                      </span>
                                      <span>
                                        • vs last {currentTimeframe.toLowerCase()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Card 2: [Timeframe] Est. Rev */}
                                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#303030] flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px] font-medium">
                                      <span>
                                        {currentTimeframe === "Day"
                                          ? "Daily"
                                          : currentTimeframe === "Month"
                                          ? "Monthly"
                                          : "Weekly"}{" "}
                                        Est. Rev
                                      </span>
                                      <span className="text-[#81c995] font-semibold text-[15px]">
                                        $
                                      </span>
                                    </div>
                                    <div className="my-2 text-[24px] font-semibold text-[#81c995] tracking-tight">
                                      $
                                      {(
                                        currentMetric.estRev ??
                                        currentMetric.adSensePotential ??
                                        49.2
                                      ).toFixed(2)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#8c8c8c]">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#81c995]" />
                                      <span>AdSense Active</span>
                                      <span>•</span>
                                      <span>
                                        Next payout {currentMetric.nextPayoutDate || "Sep 21"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Card 3: Page RPM */}
                                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#303030] flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px] font-medium">
                                      <span>Page RPM</span>
                                    </div>
                                    <div className="my-2 text-[24px] font-semibold text-[#fcfcfc] tracking-tight">
                                      ${(currentMetric.rpm ?? 16.5).toFixed(2)}
                                    </div>
                                    <div className="text-[11.5px] text-[#8c8c8c]">
                                      {(currentMetric.impressions ?? 2982).toLocaleString()}{" "}
                                      impressions • {currentMetric.ctr ?? 2.8}% CTR
                                    </div>
                                  </div>
                                </>
                              ) : (
                                /* ─── Standard Analytics View with AdSense Setup Callout ─── */
                                <>
                                  {/* Card 1: Active Users */}
                                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#303030] flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px] font-medium">
                                      <span>Active Users</span>
                                      <span className="text-[#8ab4f8]">
                                        <MsIcon name="group" size={16} />
                                      </span>
                                    </div>
                                    <div className="my-2 text-[24px] font-semibold text-[#fcfcfc] tracking-tight">
                                      {currentMetric.activeUsers.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#8c8c8c]">
                                      <span
                                        className={`inline-flex items-center gap-0.5 font-medium ${
                                          currentMetric.trendPct >= 0
                                            ? "text-[#81c995]"
                                            : "text-[#f28b82]"
                                        }`}
                                      >
                                        {currentMetric.trendPct >= 0 ? "↗" : "↘"}{" "}
                                        {currentMetric.trendPct >= 0 ? "+" : ""}
                                        {currentMetric.trendPct}%
                                      </span>
                                      <span>
                                        • vs last {currentTimeframe.toLowerCase()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Card 2: Total Unique Users */}
                                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#303030] flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px] font-medium">
                                      <span>Total Unique Users</span>
                                      <span className="text-[#9aa0a6]">
                                        <MsIcon name="shield" size={16} />
                                      </span>
                                    </div>
                                    <div className="my-2 text-[24px] font-semibold text-[#fcfcfc] tracking-tight">
                                      {currentMetric.uniqueUsers.toLocaleString()}
                                    </div>
                                    <div className="text-[11.5px] text-[#8c8c8c]">
                                      {currentMetric.pageViews.toLocaleString()} est. page views
                                    </div>
                                  </div>

                                  {/* Card 3: AdSense Setup Callout */}
                                  <div className="p-3.5 rounded-xl bg-[#262626] border border-[#303030] flex flex-col justify-between">
                                    <div className="flex items-center justify-between text-[#8c8c8c] text-[12.5px] font-medium">
                                      <span>AdSense</span>
                                    </div>
                                    <div className="my-2 flex items-baseline gap-2">
                                      <span className="text-[24px] font-semibold text-[#fcfcfc] tracking-tight">
                                        ~${(currentMetric.adSensePotential ?? 48.5).toFixed(2)}
                                      </span>
                                      <span className="text-[11.5px] text-[#8c8c8c]">
                                        est. {currentTimeframe.toLowerCase()} potential
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                      <span className="text-[11.5px] text-[#8c8c8c]">
                                        Eligible to monetize
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAdSenseModalApp(app);
                                        }}
                                        className="px-2.5 py-1 rounded-lg text-[11.5px] font-medium bg-[#323232] border border-[#3f3f3f] text-[#e3e3e3] hover:bg-[#3d3d3d] hover:text-white transition-colors"
                                      >
                                        Set up AdSense
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* ─── Footer Links ─── */}
                            <div className="flex items-center justify-between pt-3 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push("/build");
                                }}
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#fcfcfc] bg-[#2e2e2e] hover:bg-[#3d3d3d] px-3 py-1.5 rounded-lg border border-[#3a3a3a] transition-colors"
                              >
                                <MsIcon name="build" size={14} />
                                <span>Open app in Build</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAnalyticsModalApp(app);
                                }}
                                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8ab4f8] hover:text-[#aecbfa] transition-colors"
                              >
                                <span>See more in full analytics</span>
                                <MsIcon name="open_in_new" size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Grid View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {filteredApps.map((app) => {
              const trendVal = app.metrics?.Week.trendPct;
              const isPositive = trendVal !== undefined && trendVal >= 0;

              return (
                <div
                  key={app.id}
                  onClick={() => router.push("/build")}
                  className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#1d1d1d] border border-[#2c2c2c] hover:border-[#3d3d3d] hover:bg-[#222222] transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl text-white shrink-0 shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: app.iconBg }}
                    >
                      <MsIcon name={app.icon} size={20} />
                    </div>

                    {app.hasDropdown && trendVal !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${
                          isPositive
                            ? "bg-[#143321] text-[#81c995] border border-[#1f4a30]"
                            : "bg-[#331c1a] text-[#f28b82] border border-[#4a2624]"
                        }`}
                      >
                        {isPositive ? "↗" : "↘"} {isPositive ? "+" : ""}
                        {trendVal}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#777] bg-[#262626] px-2 py-0.5 rounded-md">
                        Standard
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-[14.5px] font-medium text-[#e3e3e3] group-hover:text-[#8ab4f8] transition-colors truncate">
                      {app.name}
                    </h3>
                    <p className="text-[12.5px] text-[#7d7d7d] line-clamp-2 mt-1 font-normal">
                      {app.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#262626] text-[11.5px] text-[#777]">
                    <span>{app.updatedText}</span>
                    <span className="text-[#8ab4f8] group-hover:underline">Open app →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Set up AdSense Dialog ─── */}
      <Dialog open={!!adSenseModalApp} onOpenChange={(open) => !open && setAdSenseModalApp(null)}>
        <DialogContent className="max-w-md bg-[#222222] border-[#333333] text-[#d4d4d4]">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1a73e8] text-white">
                <MsIcon name="attach_money" size={18} />
              </div>
              <DialogTitle className="text-[17px] font-semibold text-white">
                Google AdSense Monetization
              </DialogTitle>
            </div>
            <DialogDescription className="text-[#9c9c9c] text-[13px]">
              Enable Google AdSense for <strong className="text-white">{adSenseModalApp?.name}</strong> to monetize impressions and clicks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#e3e3e3]">Publisher Status</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#133824] text-[#81c995] border border-[#215a3a]">
                  Verified Eligible
                </span>
              </div>
              <p className="text-[12px] text-[#888]">
                Estimated RPM: <span className="text-[#81c995] font-semibold">$18.40</span> per 1,000 page views
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e]">
              <div>
                <div className="text-[13px] font-medium text-[#e3e3e3]">Auto-Ads Placements</div>
                <div className="text-[11.5px] text-[#888]">
                  Automatically place unobtrusive banner & rewarded ads
                </div>
              </div>
              <input
                type="checkbox"
                checked={adSenseEnabled}
                onChange={(e) => setAdSenseEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-[#8ab4f8] cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAdSenseModalApp(null)}
              className="border-[#383838] bg-[#2a2a2a] text-[#ccc] hover:bg-[#333] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAdSenseEnabled(true);
                setAdSenseModalApp(null);
              }}
              className="bg-[#1a73e8] hover:bg-[#185abc] text-white"
            >
              Save & Link Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Full Analytics Dialog ─── */}
      <Dialog open={!!analyticsModalApp} onOpenChange={(open) => !open && setAnalyticsModalApp(null)}>
        <DialogContent className="max-w-xl bg-[#222222] border-[#333333] text-[#d4d4d4]">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
                style={{ backgroundColor: analyticsModalApp?.iconBg || "#1a73e8" }}
              >
                <MsIcon name={analyticsModalApp?.icon || "query_stats"} size={18} />
              </div>
              <DialogTitle className="text-[17px] font-semibold text-white">
                {analyticsModalApp?.name} Analytics
              </DialogTitle>
            </div>
            <DialogDescription className="text-[#9c9c9c] text-[13px]">
              Comprehensive traffic, engagement, and retention breakdown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e]">
              <div>
                <div className="text-[11px] text-[#888]">Weekly Active</div>
                <div className="text-[16px] font-bold text-white">
                  {analyticsModalApp?.metrics?.Week.activeUsers.toLocaleString() || "1,840"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#888]">Avg. Session</div>
                <div className="text-[16px] font-bold text-white">4m 32s</div>
              </div>
              <div>
                <div className="text-[11px] text-[#888]">Bounce Rate</div>
                <div className="text-[16px] font-bold text-white">24.8%</div>
              </div>
            </div>

            {/* Traffic Channels Breakdown */}
            <div className="p-3.5 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e] space-y-2">
              <div className="text-[12.5px] font-medium text-[#e3e3e3]">Top Acquisition Channels</div>
              <div className="space-y-1.5 pt-1">
                {[
                  { channel: "Direct / Web Applet", pct: 48, color: "bg-[#8ab4f8]" },
                  { channel: "Google Search", pct: 32, color: "bg-[#81c995]" },
                  { channel: "Social & Shared Links", pct: 14, color: "bg-[#fdd663]" },
                  { channel: "Referral Domains", pct: 6, color: "bg-[#f28b82]" },
                ].map((item) => (
                  <div key={item.channel} className="space-y-0.5">
                    <div className="flex justify-between text-[11.5px] text-[#aaa]">
                      <span>{item.channel}</span>
                      <span className="font-medium text-white">{item.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#292929] overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Distribution */}
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e]">
                <div className="text-[#888] mb-1">Top Geography</div>
                <div className="text-white font-medium">United States (42%)</div>
                <div className="text-[#888] text-[11px] mt-0.5">Japan (18%) • Germany (14%)</div>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#2e2e2e]">
                <div className="text-[#888] mb-1">Device Split</div>
                <div className="text-white font-medium">Mobile (68%) • Desktop (32%)</div>
                <div className="text-[#888] text-[11px] mt-0.5">iOS 45% • Android 23% • Mac 18%</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setAnalyticsModalApp(null)}
              className="bg-[#333] hover:bg-[#3f3f3f] text-white border border-[#444]"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
