'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useInvoiceDraftStore } from '@/lib/stores/invoiceDraftStore';
import {
  Sparkles,
  Send,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Wrench,
  Zap,
  Bot,
  User,
  Square,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STARTER_PROMPTS = [
  '5kVA Solar Kit setup with installation',
  'Add 10 panels (330W) and a 5kVA inverter',
  '3kW Complete Home Solar System',
  'Add battery cables, MC4 connectors & changeover',
];

export default function InvoiceChatAssistant() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedToolCalls = useRef<Set<string>>(new Set());

  const { addItem, setItems, setCustomer, setDiscount, setNotes } = useInvoiceDraftStore();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/invoice-agent',
      }),
    []
  );

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
  } = useChat({
    transport,
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Sync tool calls to invoice draft state
  useEffect(() => {
    for (const msg of messages) {
      if (!msg.parts || !Array.isArray(msg.parts)) continue;

      for (const part of msg.parts) {
        const isUpdateTool =
          part.type === 'tool-update_invoice_items' ||
          (part.type === 'dynamic-tool' && (part as any).toolName === 'update_invoice_items') ||
          (part.type === 'tool-invocation' && (part as any).toolInvocation?.toolName === 'update_invoice_items') ||
          (part as any).toolName === 'update_invoice_items' ||
          (part as any).name === 'update_invoice_items';

        if (isUpdateTool) {
          const toolInvocation = (part as any).toolInvocation || part;
          const callId = toolInvocation.toolCallId || (part as any).id || (part as any).toolCallId || `${msg.id}-${part.type}`;
          if (processedToolCalls.current.has(callId)) continue;

          const payload =
            toolInvocation.output ||
            toolInvocation.args ||
            toolInvocation.input ||
            (part as any).output ||
            (part as any).input;

          if (payload && Array.isArray(payload.items) && payload.items.length > 0) {
            processedToolCalls.current.add(callId);

            if (payload.action === 'add') {
              payload.items.forEach((item: any) => {
                addItem({
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  spec: item.spec,
                  capacity: item.capacity,
                });
              });
            } else {
              setItems(
                payload.items.map((item: any) => ({
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  spec: item.spec,
                  capacity: item.capacity,
                }))
              );
            }

            if (payload.customer) {
              setCustomer(payload.customer);
            }
            if (typeof payload.discount === 'number') {
              setDiscount(payload.discount);
            }
            if (payload.notes) {
              setNotes(payload.notes);
            }

            toast.success(`Synced ${payload.items.length} items to invoice`);
          }
        }
      }
    }
  }, [messages, addItem, setItems, setCustomer, setDiscount, setNotes]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isStreaming) return;

    sendMessage({ text });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    processedToolCalls.current.clear();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                AI Sales Agent
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini 3.5 Flash Lite
              </span>
              <span className="sm:hidden inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini 3.5
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Intelligent sales quoting & real-time canvas sync
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Clear</span>
          </button>
        )}
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="py-8 px-2 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                How can I help build this invoice?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Describe the solar kit, inverters, panels, accessories, or services. I will verify
                inventory and sync items to your live commercial invoice canvas.
              </p>
            </div>

            {/* Suggested Starter Chips */}
            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-2">
                Suggested Starters
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-xs text-left px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-750 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 transition-all text-[11px]"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-gray-100 dark:bg-gray-750 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200/60 dark:border-gray-700'
                  }`}
                >
                  {/* Render parts */}
                  {m.parts && Array.isArray(m.parts) ? (
                    m.parts.map((part, pIdx) => {
                      if (part.type === 'text') {
                        return (
                          <div
                            key={pIdx}
                            className="whitespace-pre-wrap leading-relaxed space-y-1"
                          >
                            {part.text}
                          </div>
                        );
                      }

                      // Tool: search_catalog indicator
                      const isSearchTool =
                        part.type === 'tool-search_catalog' ||
                        (part.type === 'dynamic-tool' && (part as any).toolName === 'search_catalog');

                      if (isSearchTool) {
                        const toolInv = part as any;
                        const query = toolInv.input?.query || '';
                        const matchCount = toolInv.output?.matchCount;

                        return (
                          <div
                            key={pIdx}
                            className="my-1.5 p-2 rounded-lg bg-white/70 dark:bg-gray-800/80 border border-blue-200 dark:border-blue-800 text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-2"
                          >
                            <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <div className="flex-1 truncate">
                              Searching catalog for: <span className="font-semibold">"{query}"</span>
                            </div>
                            {matchCount !== undefined && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                ✓ {matchCount} found
                              </span>
                            )}
                          </div>
                        );
                      }

                      // Tool: update_invoice_items indicator
                      const isUpdateTool =
                        part.type === 'tool-update_invoice_items' ||
                        (part.type === 'dynamic-tool' &&
                          (part as any).toolName === 'update_invoice_items');

                      if (isUpdateTool) {
                        const toolInv = part as any;
                        const count =
                          toolInv.input?.items?.length || toolInv.output?.itemCount || 0;

                        return (
                          <div
                            key={pIdx}
                            className="my-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2"
                          >
                            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-semibold">
                              ⚡ Synced {count} line {count === 1 ? 'item' : 'items'} directly to the invoice canvas!
                            </span>
                          </div>
                        );
                      }

                      return null;
                    })
                  ) : (
                    // Fallback for string-based message
                    <div className="whitespace-pre-wrap">{(m as any).content}</div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-9">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-[11px]">Consulting inventory catalog...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error.message || 'Error communicating with AI assistant'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type items to add or ask a question..."
            disabled={isStreaming}
            className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          />

          {isStreaming ? (
            <button
              onClick={() => stop()}
              className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
              title="Stop generating"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-40"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
          AI references strictly verified Power Afric catalog prices (0% VAT).
        </p>
      </div>
    </div>
  );
}
