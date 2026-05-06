import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Trash2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = { role: 'user' | 'assistant'; content: string };

// Use the original project's Edge Function for AI (it has the LOVABLE_API_KEY configured)
const CHAT_URL = 'https://yqbusaltblxdviotfyjs.supabase.co/functions/v1/chat';
const CHAT_AUTH = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYnVzYWx0Ymx4ZHZpb3RmeWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODU2NTUsImV4cCI6MjA5MTA2MTY1NX0.iJLP5kEM_oSb__VOcJcM6ypap2J2h7GTx5OSYKn7lDw';

const SUGGESTIONS = [
  "What's the difference between an array and a linked list?",
  "Give me a roadmap to learn Data Structures",
  "Explain recursion like I'm 5",
  "Compare Python vs JavaScript",
  "How does the internet work?",
  "What is Big-O notation?",
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CHAT_AUTH}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get response');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message || 'Something went wrong. Please try again.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)} title="Chat with Gnosis" id="chat-fab">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="chat-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
            style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          />

          {/* Chat panel */}
          <div
            className="chat-panel"
            role="dialog"
            aria-label="Gnosis AI Chat"
            style={{
              position: 'fixed',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border-light)',
              borderRadius: '1rem',
              boxShadow: '0 12px 40px -8px rgba(0,0,0,0.15)',
              bottom: '80px',
              right: '20px',
              width: '400px',
              height: '540px',
              maxHeight: 'calc(100vh - 100px)',
              maxWidth: 'calc(100vw - 40px)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-body)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>CodeLingo AI</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Ask me anything!</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    title="Clear chat"
                    style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                      <Bot size={24} color="white" />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Hi! I'm your CS assistant. Ask me anything — definitions, roadmaps, comparisons, or general knowledge!</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', margin: 0 }}>Try asking:</p>
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                          fontSize: '14px', color: 'var(--text)', background: 'var(--bg-body)',
                          border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                        <Bot size={14} color="white" />
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '80%', borderRadius: '12px', padding: '8px 12px', fontSize: '14px',
                        backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-body)',
                        color: msg.role === 'user' ? 'white' : 'var(--text)',
                        border: msg.role === 'assistant' ? '1px solid var(--border-light)' : 'none',
                        lineHeight: 1.5
                      }}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p style={{ margin: 0 }}>{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                        <User size={14} color="white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="white" />
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', animation: 'pulse 1s infinite' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', animation: 'pulse 1s infinite 0.2s' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', animation: 'pulse 1s infinite 0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{ borderTop: '1px solid var(--border-light)', padding: '10px 12px', display: 'flex', gap: '8px', backgroundColor: 'var(--bg-body)' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything..."
                disabled={isLoading}
                style={{
                  flex: 1, backgroundColor: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border-light)',
                  borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  padding: '8px', borderRadius: '8px', backgroundColor: 'var(--accent)', color: 'white', border: 'none',
                  cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer', opacity: (!input.trim() || isLoading) ? 0.5 : 1
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
