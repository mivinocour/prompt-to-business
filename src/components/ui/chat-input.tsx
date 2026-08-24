"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ChevronsDownUp, ChevronRight } from "lucide-react";
import { MsIcon } from "@/components/ui/ms-icon";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  prompts?: string[];
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  showTools?: boolean;
  showPlus?: boolean;
  submitLabel?: string;
  apiKeyConfigured?: boolean;
  agentMode?: boolean;
}

// Agent tool chip — matches live: bg #393F51, radius 12, h-32, 14/400, × to remove
function AgentToolChip({
  icon,
  label,
  onRemove,
}: {
  icon: React.ReactNode;
  label: string;
  onRemove?: () => void;
}) {
  return (
    <div
      className="flex items-center flex-shrink-0"
      style={{
        gap: '6px',
        height: '32px',
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: 'var(--color-v3-button-container)',
        color: 'var(--color-v3-text)',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
      {onRemove && (
        <button
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-v3-text-var)',
            cursor: 'pointer',
            padding: '2px',
          }}
        >
          <MsIcon name="close" size={14} />
        </button>
      )}
    </div>
  );
}

export interface ChatInputRef {
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({
  value,
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = "",
  prompts = [],
  isLoading = false,
  disabled = false,
  className,
  showTools = true,
  showPlus = true,
  submitLabel = "Run",
  apiKeyConfigured = false,
  agentMode = false,
}, ref) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(true);
  const [agentChips, setAgentChips] = useState<string[]>(["code", "search", "url", "filesystem"]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const agentToolsTrackRef = useRef<HTMLDivElement>(null);

  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  // Auto-rotate prompts when user isn't typing
  useEffect(() => {
    if (!isUserTyping && prompts.length > 0) {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isUserTyping, prompts.length]);

  // Update typing state when value changes
  useEffect(() => {
    setIsUserTyping(value.length > 0);
  }, [value]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '21px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 210) + 'px';
    }
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleTabNavigation = () => {
    if (!isUserTyping && prompts.length > 0) {
      onChange(prompts[currentPromptIndex]);
      setIsUserTyping(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabNavigation();
    }
  };

  const currentPrompt = prompts.length > 0 ? prompts[currentPromptIndex] : placeholder;
  const displayPlaceholder = agentMode
    ? "Start typing a prompt to see what our agents can do"
    : (currentPrompt || "Start typing a prompt, use option + enter to append");
  const isDisabledState = isLoading || !value.trim() || disabled;

  return (
    <div className={cn("prompt-composer-shell sticky bottom-0 px-0 pb-safe max-w-[1000px] mx-auto w-full", className)}>
      {/* Agent disclaimer banner — matches live ms-light-bulb-disclaimer */}
      {agentMode && isDisclaimerExpanded && (
        <div
          className="flex items-center justify-between"
          style={{
            margin: '0 25px -1px 25px',
            padding: '8px 12px 10px',
            borderRadius: '6px 6px 0 0',
            backgroundColor: 'var(--color-v3-surface-container)',
            gap: '4px',
          }}
        >
          <div className="flex items-center" style={{ gap: '8px', minWidth: 0 }}>
            <MsIcon name="lightbulb" size={14} className="flex-shrink-0" style={{ color: 'var(--color-v3-text-var)' }} />
            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                color: 'var(--color-v3-text-var)',
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '18px',
              }}
            >
              This agent can execute code, take real actions, and use large number of tokens. You can stop the agent at any time.{' '}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'var(--color-v3-outline-accent)', textDecoration: 'none' }}
              >
                Learn more
              </a>
            </span>
          </div>
          <button
            aria-label="Collapse agent disclaimer"
            className="prompt-btn-icon flex-shrink-0"
            onClick={() => setIsDisclaimerExpanded(false)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 0, borderRadius: '50%', color: 'var(--color-v3-text-var)', background: 'transparent' }}
          >
            <ChevronsDownUp aria-hidden size={14} strokeWidth={1.75} />
          </button>
        </div>
      )}
      {agentMode && !isDisclaimerExpanded && (
        <div className="flex justify-end" style={{ margin: '0 25px -1px' }}>
          <button
            aria-label="Show agent disclaimer"
            className="prompt-btn-icon"
            onClick={() => setIsDisclaimerExpanded(true)}
            style={{ width: 32, height: 28, border: 0, borderRadius: '8px 8px 0 0', color: 'var(--color-v3-text-var)', background: 'var(--color-v3-surface-container)' }}
          >
            <MsIcon name="lightbulb" size={15} />
          </button>
        </div>
      )}

      {/* Prompt Box Container — uses v3 tokens */}
      <div
        className={cn(
          "prompt-box-container",
          "flex flex-col gap-2 relative transition-shadow duration-200 ease-in-out",
          isFocused && "prompt-box-focused"
        )}
        style={{
          boxShadow: 'var(--v3-shadow-md)',
          backgroundColor: 'var(--color-v3-surface-container-high)',
          border: isFocused
            ? '1px solid var(--color-v3-outline-accent)'
            : '1px solid var(--color-v3-outline-var)',
          borderRadius: '12px',
          padding: '12px',
          margin: '0px 12px 12px 12px',
        }}
      >
        {/* Text Input Area */}
        <div
          className="text-wrapper"
          style={{
            display: 'flex',
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: '0%',
            minHeight: '36px',
            minWidth: '0px',
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={displayPlaceholder}
            aria-label="Enter a prompt"
            disabled={disabled || isLoading}
            className="prompt-textarea"
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '21px',
              color: 'var(--color-v3-text)',
              alignContent: 'center',
              boxSizing: 'border-box',
              display: 'flex',
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: '0px',
              flexDirection: 'column',
              outlineStyle: 'none',
              overflowWrap: 'anywhere',
              minWidth: '0px',
              whiteSpace: 'pre-wrap',
              width: '100%',
              background: 'transparent',
              border: 'none',
              resize: 'none',
              minHeight: '21px',
              maxHeight: '210px',
              height: '21px',
              padding: '0px',
            }}
          />
        </div>

        {/* Buttons Row */}
        <div
          className="buttons-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left Side Buttons */}
          <div
            className="button-row-left"
            style={{
              alignItems: 'center',
              display: 'flex',
              flexGrow: 1,
              minWidth: '0px',
              gap: '12px',
              overflowX: 'hidden',
              overflowY: 'hidden',
            }}
          >
            {/* API Key Button */}
            <button
              className="prompt-btn prompt-btn-primary"
              aria-label={apiKeyConfigured ? "API key selected" : "API key"}
              title={apiKeyConfigured ? "API key configured" : "No API key"}
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                fontFamily: 'var(--font-inter), sans-serif',
                alignItems: 'center',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out, box-shadow 0.1s ease-in-out',
                height: '32px',
                width: '32px',
                backgroundColor: 'var(--color-v3-button-container)',
                color: 'var(--color-v3-text-on-button)',
                boxSizing: 'border-box',
                border: '1px solid var(--color-v3-outline)',
                borderRadius: '12px',
                padding: '0px',
              }}
            >
              <MsIcon name={apiKeyConfigured ? "key" : "key_off"} />
            </button>

            {/* Tools Button */}
            {showTools && (
              <button
                className="prompt-btn prompt-btn-primary"
                aria-label="Open tools menu"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  fontFamily: 'var(--font-inter), sans-serif',
                  alignItems: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out, box-shadow 0.1s ease-in-out',
                  whiteSpace: 'nowrap',
                  height: '32px',
                  backgroundColor: 'var(--color-v3-button-container)',
                  color: 'var(--color-v3-text-on-button)',
                  boxSizing: 'border-box',
                  border: '1px solid var(--color-v3-outline)',
                  borderRadius: '12px',
                  padding: '0px 12px',
                }}
              >
                <MsIcon name="widgets" />
                {' '}Tools
              </button>
            )}

            {agentMode && (
              <div className="agent-tools-carousel">
                <div ref={agentToolsTrackRef} className="agent-tools-track">
                  {agentChips.includes('code') && (
                    <AgentToolChip
                      icon={<MsIcon name="code" />}
                      label="Code execution"
                      onRemove={() => setAgentChips((chips) => chips.filter((chip) => chip !== 'code'))}
                    />
                  )}
                  {agentChips.includes('search') && (
                    <AgentToolChip
                      icon={<MsIcon name="google" size={16} />}
                      label="Grounding with Google Search"
                      onRemove={() => setAgentChips((chips) => chips.filter((chip) => chip !== 'search'))}
                    />
                  )}
                  {agentChips.includes('url') && (
                    <AgentToolChip
                      icon={<MsIcon name="link" />}
                      label="URL context"
                      onRemove={() => setAgentChips((chips) => chips.filter((chip) => chip !== 'url'))}
                    />
                  )}
                  {agentChips.includes('filesystem') && (
                    <AgentToolChip icon={<MsIcon name="folder" />} label="Filesystem tools" />
                  )}
                </div>
                <button
                  type="button"
                  className="agent-tools-scroll-button"
                  aria-label="Scroll right"
                  onClick={() => agentToolsTrackRef.current?.scrollBy({ left: 180, behavior: 'smooth' })}
                >
                  <ChevronRight aria-hidden size={18} strokeWidth={1.75} />
                </button>
              </div>
            )}
          </div>

          {/* Right Side Buttons */}
          <div
            className="button-wrapper"
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '8px',
              height: '36px',
              flexShrink: 0,
            }}
          >
            {/* Microphone Button — matches live AI Studio */}
            <button
              className="prompt-btn-icon"
              aria-label="Speech to text"
              style={{
                alignItems: 'center',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
                height: '32px',
                color: 'var(--color-v3-text)',
                aspectRatio: '1 / 1',
                boxSizing: 'border-box',
                border: '1px solid transparent',
                borderRadius: '50%',
                padding: '0px',
                background: 'transparent',
              }}
            >
              <MsIcon name="mic" />
            </button>

            {/* Add Media Button */}
            {showPlus && (
              <button
                className="prompt-btn-icon"
                aria-label="Insert images or files"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  fontFamily: 'var(--font-inter), sans-serif',
                  alignItems: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out, box-shadow 0.1s ease-in-out',
                  whiteSpace: 'nowrap',
                  height: '32px',
                  color: 'var(--color-v3-text)',
                  aspectRatio: '1 / 1',
                  boxSizing: 'border-box',
                  border: '1px solid transparent',
                  borderRadius: '50%',
                  padding: '0px',
                  background: 'transparent',
                  marginRight: '4px',
                }}
              >
                <MsIcon name="add_circle" />
              </button>
            )}

            {/* Run Button */}
            <button
              onClick={onSubmit}
              disabled={isDisabledState}
              type="submit"
              className="prompt-btn prompt-btn-run"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                fontFamily: 'var(--font-inter), sans-serif',
                alignItems: 'center',
                cursor: isDisabledState ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out, box-shadow 0.1s ease-in-out',
                whiteSpace: 'nowrap',
                height: '32px',
                backgroundColor: isDisabledState
                  ? 'var(--color-v3-surface-container)'
                  : 'var(--color-v3-button-container)',
                color: isDisabledState
                  ? 'rgb(87, 87, 87)'
                  : 'var(--color-v3-text-on-button)',
                boxSizing: 'border-box',
                border: isDisabledState
                  ? '1px solid transparent'
                  : '1px solid var(--color-v3-outline)',
                borderRadius: '12px',
                padding: '0px 12px',
              }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span style={{ minWidth: '28px' }}>{submitLabel}</span>
              )}
              <MsIcon name="keyboard_return" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';
