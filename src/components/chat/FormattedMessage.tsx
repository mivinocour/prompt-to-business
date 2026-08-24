"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { cn } from '@/lib/utils';

interface FormattedMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function FormattedMessage({ content, isStreaming }: FormattedMessageProps) {
  return (
    <div className={cn("prose prose-invert prose-sm max-w-none", isStreaming && "streaming-active")}>
      {content.length > 0 && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node: _node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');

              if (match) {
                const code = String(children).replace(/\n$/, '');
                return <CodeBlock code={code} language={match[1]} />;
              }

              return (
                <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children, ...props }) => (
              <div className="mb-4 last:mb-0 text-foreground" style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
              }} {...props}>
                {children}
              </div>
            ),
            pre: ({ children }) => (
              <div className="my-4">
                {children}
              </div>
            ),
            h1: ({ children }) => <h1 className="text-xl font-semibold mb-4 text-foreground">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 text-foreground">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-foreground">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
            li: ({ children }) => (
              <li className="text-foreground" style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {children}
              </li>
            ),
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            hr: () => (
              <hr className="my-6 border-0 h-px bg-border" />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      )}
      {isStreaming && (
        <div className="mt-2 inline-flex items-center gap-2">
          <div
            className="text-sm font-medium animate-shimmer"
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              background: 'linear-gradient(to right, #4d4d4d 0%, white 10%, #4d4d4d 20%)',
              backgroundPosition: '0',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              whiteSpace: 'nowrap'
            }}
          >
            Generating response
          </div>
        </div>
      )}
    </div>
  );
}
