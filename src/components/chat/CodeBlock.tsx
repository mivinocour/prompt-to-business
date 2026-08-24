"use client";

import { useState } from 'react';
import { Check, ChevronRight, Copy, Download, Layers3, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

const SyntaxHighlighter = Prism as unknown as React.ComponentType<any>;

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    const extension = language === 'python' ? '.py' : language === 'javascript' ? '.js' : '.txt';
    const filename = `code${extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="self-stretch relative rounded-xl border overflow-hidden mt-4 sm:mt-6 mb-4 sm:mb-6" 
         style={{ 
           background: 'var(--theme-codeblock-bg)',
           borderColor: 'var(--theme-codeblock-border)'
         }}>
      <div className="w-full px-2 sm:px-3 py-2 inline-flex justify-start items-center overflow-hidden">
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2 sm:gap-3">
          {/* Header */}
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-1">
              <div className="w-4 h-4 relative overflow-hidden flex items-center justify-center">
                <Code className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
              <div 
                className="justify-center text-xs font-medium leading-tight text-foreground"
                style={{
                  fontFamily: 'var(--font-inter-tight), system-ui, sans-serif'
                }}
              >
                {language.charAt(0).toUpperCase() + language.slice(1)}
              </div>
            </div>
            <div className="flex justify-start items-center gap-2 sm:gap-4">
              {/* Convert to App Button - Hidden on mobile */}
              <button className="w-5 h-5 sm:w-6 sm:h-6 p-1 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors hidden sm:flex">
                <Layers3 className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </button>
              
              {/* Download Button */}
              <button 
                onClick={handleDownload}
                className="w-5 h-5 sm:w-6 sm:h-6 p-1 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </button>

              {/* Copy Button */}
              <button 
                onClick={handleCopy}
                className="w-5 h-5 sm:w-6 sm:h-6 p-1 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                )}
              </button>

              {/* Collapse/Expand Button */}
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-5 h-5 sm:w-6 sm:h-6 p-1 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <motion.div
                  key={`chevron-${isCollapsed}`}
                  initial={{ rotate: isCollapsed ? 90 : -90 }}
                  animate={{ rotate: isCollapsed ? 90 : -90 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                </motion.div>
              </button>
            </div>
          </div>

          {/* Code Content with smooth animation */}
          <motion.div 
            className="self-stretch overflow-hidden"
            initial={false}
            animate={{ 
              height: isCollapsed ? 0 : "auto",
              opacity: isCollapsed ? 0 : 1
            }}
            transition={{ 
              height: { duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.2, ease: "easeInOut" }
            }}
          >
            <div className="self-stretch overflow-x-auto">
              <SyntaxHighlighter
                language={language}
                style={theme === 'light' ? oneLight : oneDark}
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: 'transparent !important',
                  backgroundColor: 'transparent !important',
                  fontSize: '11px',
                  lineHeight: '1.4',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }}
                codeTagProps={{
                  style: {
                    background: 'transparent !important',
                    backgroundColor: 'transparent !important',
                    color: 'var(--theme-code-text)',
                  }
                }}
                showLineNumbers={false}
                wrapLines={true}
                wrapLongLines={true}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
