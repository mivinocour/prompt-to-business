"use client";

import { ArrowLeft, Share, ArrowUpDown, RotateCcw, MoreVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UsageMetrics } from "@/types/chat";

interface ChatHeaderProps {
  chatName: string;
  usage: UsageMetrics;
  currentModelName: string;
  onReset: () => void;
  onBack: () => void;
}

export function ChatHeader({
  chatName,
  usage,
  currentModelName,
  onReset,
  onBack,
}: ChatHeaderProps) {
  return (
    <div 
      className="sticky top-0 w-full z-10"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="pt-5 pb-[14px] px-8">
        <div className="flex justify-center items-center gap-2 sm:gap-4 sm:justify-between">
          {/* Back button */}
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors p-1 flex items-center justify-center flex-shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>


          {/* Left side - Chat info */}
          <div className="flex justify-start items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div 
              className="justify-center text-xs font-normal leading-tight truncate max-w-[120px] sm:max-w-none"
              style={{
                color: 'var(--theme-header-text)',
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
              }}
            >
              {chatName}
            </div>
            {/* Desktop-only detailed stats */}
            <div className="hidden lg:flex items-center gap-3">
              <div 
                className="justify-center text-xs font-medium leading-tight"
                style={{
                  color: 'var(--theme-header-text)',
                  fontFamily: 'var(--font-inter-tight), system-ui, sans-serif',
                }}
              >
                •
              </div>
              <div 
                className="justify-center text-xs font-normal leading-tight"
                style={{
                  color: 'var(--theme-header-text)',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}
              >
                {usage.totalTokens.toLocaleString()} tokens
              </div>
              <div 
                className="justify-center text-xs font-medium leading-tight"
                style={{
                  color: 'var(--theme-header-text)',
                  fontFamily: 'var(--font-inter-tight), system-ui, sans-serif',
                }}
              >
                •
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="justify-center text-xs font-normal leading-tight cursor-help"
                      style={{
                        color: 'var(--theme-header-text)',
                        fontFamily: 'var(--font-inter), system-ui, sans-serif',
                      }}
                    >
                      ${usage.totalCost.toFixed(6)} est.
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover border-border text-popover-foreground p-3 max-w-xs">
                    <div className="space-y-2 text-xs">
                      <div className="font-medium text-foreground">Cost Breakdown</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Input tokens:</span>
                          <span>{usage.inputTokens.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Output tokens:</span>
                          <span>{usage.outputTokens.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border pt-1 mt-1">
                          <div className="flex justify-between">
                            <span>Total tokens:</span>
                            <span>{usage.totalTokens.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-foreground">
                          <span>Input cost:</span>
                          <span>${usage.inputCost.toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between text-foreground">
                          <span>Output cost:</span>
                          <span>${usage.outputCost.toFixed(6)}</span>
                        </div>
                        <div className="border-t border-border pt-1 mt-1">
                          <div className="flex justify-between font-medium">
                            <span>Total cost:</span>
                            <span>${usage.totalCost.toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs pt-1">
                        * Based on {currentModelName} pricing
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {/* Mobile simplified stats */}
            <div className="flex lg:hidden items-center gap-1 text-xs whitespace-nowrap" style={{color: 'var(--theme-header-text)'}}>
              <span>•</span>
              <span className="truncate">{usage.totalTokens > 0 ? `${Math.round(usage.totalTokens / 1000)}k` : 'New'}</span>
            </div>
          </div>
          
          {/* Right side - Action buttons */}
          <div className="flex justify-end items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            {/* Desktop: Individual buttons */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3">
              {/* Share Button */}
              <button className="w-6 h-6 relative rounded-lg overflow-hidden hover:bg-white/10 transition-colors p-1 flex items-center justify-center">
                <Share className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {/* Compare Button */}
              <button className="w-6 h-6 relative rounded-lg overflow-hidden hover:bg-white/10 transition-colors p-1 flex items-center justify-center">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {/* Reset Button */}
              <button
                className="w-6 h-6 relative rounded-lg overflow-hidden hover:bg-white/10 transition-colors p-1 flex items-center justify-center"
                onClick={onReset}
              >
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {/* More Actions Button */}
              <button className="w-6 h-6 relative rounded-lg overflow-hidden hover:bg-white/10 transition-colors p-1 flex items-center justify-center">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Mobile: Dropdown menu only */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-6 h-6 relative rounded-lg overflow-hidden hover:bg-white/10 transition-colors p-1 flex items-center justify-center">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Compare
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
