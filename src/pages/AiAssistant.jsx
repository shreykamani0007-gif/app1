import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  User,
  Calendar,
  Loader2,
  X,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { useEventContext } from '../context/EventContext';
import { sendAiMessage, getAiStatus } from '../services/api';

/**
 * Structured text renderer for AI responses supporting:
 * - Code blocks (```lang ... ```)
 * - Headings (#, ##, ###, ####)
 * - Bullet lists (- item or * item)
 * - Numbered lists (1. item)
 * - Bold (**text**), inline code (`code`), italic (*text*)
 */
function MarkdownRenderer({ content }) {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-slate-800 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();

        // Code block
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const lines = trimmed.slice(3, -3).trim().split('\n');
          const lang = lines[0].match(/^[a-z0-9_-]+$/i) ? lines.shift() : '';
          return (
            <div key={bIdx} className="my-2 rounded-xl bg-slate-900 text-slate-100 p-3.5 text-xs font-mono overflow-x-auto shadow-inner">
              {lang && <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">{lang}</div>}
              <pre className="whitespace-pre-wrap">{lines.join('\n')}</pre>
            </div>
          );
        }

        // Headings
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={bIdx} className="font-bold text-slate-800 text-xs sm:text-sm mt-2 mb-1">
              {renderInline(trimmed.replace(/^####\s+/, ''))}
            </h5>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={bIdx} className="font-bold text-slate-900 text-sm sm:text-base mt-2 mb-1">
              {renderInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={bIdx} className="font-bold text-slate-900 text-base sm:text-lg mt-3 mb-1 border-b border-slate-200 pb-1">
              {renderInline(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={bIdx} className="font-extrabold text-slate-900 text-lg sm:text-xl mt-3 mb-1.5">
              {renderInline(trimmed.replace(/^#\s+/, ''))}
            </h2>
          );
        }

        // Horizontal rule
        if (trimmed === '---') {
          return <hr key={bIdx} className="border-slate-200 my-2" />;
        }

        // List block (bullets or numbers)
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const isNumberedList = lines.every((l) => /^\s*\d+[\.)]\s+/.test(l));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-brand-600">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInline(line.replace(/^\s*[-*•]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-1.5 my-2 pl-4 list-decimal marker:text-brand-600 marker:font-semibold">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInline(line.replace(/^\s*\d+[\.)]\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Regular paragraph with linebreaks
        return (
          <p key={bIdx}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {renderInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Formats inline Markdown: **bold**, `code`, and *italic*
 */
function renderInline(text) {
  if (!text) return text;

  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-brand-700 font-mono text-[11px] sm:text-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em key={idx} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

export default function AiAssistant() {
  const { selectedEvent, selectedEventId } = useEventContext();

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // AI Configuration status (queried from backend)
  const [aiConfig, setAiConfig] = useState({
    configured: true,
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Clean, natural initial greeting
  const getInitialGreeting = () => ({
    id: 'welcome-msg',
    role: 'assistant',
    content: "Hello! How can I help you today? Feel free to ask general questions or anything related to your club's active event.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState(() => [getInitialGreeting()]);

  // Query backend AI status on mount
  useEffect(() => {
    getAiStatus()
      .then((res) => {
        if (res && typeof res.configured === 'boolean') {
          setAiConfig({ configured: res.configured });
        }
      })
      .catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const samplePrompts = [
    {
      title: 'Draft Volunteer Announcement',
      prompt: 'Draft an announcement for volunteers.',
      desc: 'Generate shift notice with event roster',
    },
    {
      title: 'Show Overdue Tasks',
      prompt: 'Show my overdue tasks.',
      desc: 'Review upcoming and pending deadlines',
    },
    {
      title: 'Summarize Active Event',
      prompt: 'Summarize the current event.',
      desc: 'Quick breakdown of tasks, roster & schedule',
    },
    {
      title: 'Explain Recursion',
      prompt: 'Explain recursion in simple words.',
      desc: 'Clear technical explanation with examples',
    },
  ];

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query || loading) return;

    setErrorMessage(null);
    setInputVal('');

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== 'welcome-msg')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await sendAiMessage(query, selectedEventId, historyPayload);

      if (res && res.success && res.reply) {
        const assistantMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorText = res?.message || 'Failed to get a response from ClubOps AI.';
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error('[AI Assistant Client Error]:', err);
      setErrorMessage(
        err.message || 'Unable to connect to AI service. Please make sure the backend is running.'
      );
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([getInitialGreeting()]);
    setErrorMessage(null);
    setInputVal('');
  };

  const isStarterState = messages.length <= 1;

  return (
    <div className="w-full h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Sleek Top Navigation Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-4 sm:px-6 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-brand-500/25 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">ClubOps Copilot</h1>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Calendar className="w-3 h-3 text-brand-600" />
                Active Event: {selectedEvent?.name || 'All Events'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {aiConfig.configured ? (
            <StatusBadge status="confirmed" label="Google Gemini Connected" />
          ) : (
            <StatusBadge status="urgent" label="AI Offline" />
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleClearChat}
            title="Reset conversation"
            className="text-xs h-8 text-slate-500 hover:text-slate-800"
          >
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <Card className="flex-1 flex flex-col min-h-0 border-slate-200/90 shadow-sm overflow-hidden bg-gradient-to-b from-slate-50/40 via-white to-white">
        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[94%] sm:max-w-[85%] lg:max-w-[80%] ${
                  isAi ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-start'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isAi
                      ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-brand-500/20'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col group min-w-0">
                  <div
                    className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs relative ${
                      isAi
                        ? 'bg-white border border-slate-200/90 text-slate-800'
                        : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isAi ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    )}

                    {/* Copy action on AI bubbles */}
                    {isAi && msg.id !== 'welcome-msg' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Metadata */}
                  <span
                    className={`text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1.5 ${
                      isAi ? 'text-left' : 'text-right justify-end'
                    }`}
                  >
                    {isAi ? (
                      <>
                        <span>ClubOps AI</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <span>You</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Action Cards in Starter State */}
          {isStarterState && (
            <div className="my-6 pt-4 border-t border-slate-100 animate-fade-in max-w-3xl">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Try Asking:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {samplePrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 text-xs transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="font-semibold text-slate-800 group-hover:text-brand-700 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-brand-200 rounded-2xl px-4 py-3 shadow-2xs text-xs text-slate-700 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
                <span>ClubOps AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-rose-700 leading-relaxed">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Compact Quick Suggestions Pill Bar (Only when chat has started) */}
        {!isStarterState && (
          <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200/70 shrink-0 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestions:
            </span>
            {samplePrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSendMessage(item.prompt)}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 text-[11px] text-slate-600 font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        {/* Full-Width Bottom Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 shrink-0">
          <div className="relative flex items-center bg-slate-50/90 border border-slate-300 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-2xs">
            <input
              ref={textareaRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask anything or request event operations tasks..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
            />
            <div className="shrink-0 pr-1">
              <Button
                type="button"
                size="sm"
                variant="primary"
                icon={loading ? Loader2 : Send}
                disabled={!inputVal.trim() || loading}
                onClick={() => handleSendMessage()}
                className={loading ? 'animate-pulse' : ''}
              >
                <span>{loading ? 'Thinking...' : 'Send'}</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mt-1.5 px-1">
            <span>
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Shift + Enter</kbd> for newline
            </span>
            <span className="text-slate-400">Powered by Google Gemini</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
