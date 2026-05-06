import React, { useEffect, useRef, useState, useMemo } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import 'highlight.js/styles/github-dark.css';
import { Copy, Check, Play, Terminal, Code2, ChevronDown, ChevronUp } from 'lucide-react';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('dockerfile', dockerfile);

const langIcons: Record<string, string> = {
  python: 'PY',
  javascript: 'JS',
  sql: 'SQL',
  bash: 'SH',
  dockerfile: 'DKR',
};

const langColors: Record<string, string> = {
  python: '#3776ab',
  javascript: '#f7df1e',
  sql: '#e38c00',
  bash: '#4eaa25',
  dockerfile: '#2496ed',
};

interface Props { code: string; language: string; description?: string; }

export default function CodeBlock({ code, language, description }: Props) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const lines = useMemo(() => code.split('\n'), [code]);
  const lineCount = lines.length;

  useEffect(() => {
    if (codeRef.current && !collapsed) {
      codeRef.current.textContent = code;
      hljs.highlightElement(codeRef.current);
    }
  }, [code, collapsed]);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langColor = langColors[language] || 'var(--accent)';
  const langIcon = langIcons[language] || '';

  // Extract output from comments like "# Output: ..." or "// Output: ..."
  const outputLines = useMemo(() => {
    const outputs: string[] = [];
    lines.forEach(line => {
      const match = line.match(/(?:#|\/\/)\s*(?:Output|output|Result|result):\s*(.*)/);
      if (match) outputs.push(match[1].trim());
    });
    return outputs;
  }, [lines]);

  return (
    <div className="code-editor">
      {/* Title bar — like a real IDE/terminal window */}
      <div className="code-editor-titlebar">
        <div className="code-editor-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <div className="code-editor-title">
          <span className="code-editor-lang-badge" style={{ '--lang-color': langColor } as React.CSSProperties}>
            {langIcon} {language}
          </span>
          {description && <span className="code-editor-desc">{description}</span>}
        </div>
        <div className="code-editor-actions">
          <button
            className="code-editor-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            className="code-editor-btn"
            onClick={copy}
            title="Copy code"
          >
            {copied ? <><Check size={14} /> <span>Copied!</span></> : <><Copy size={14} /> <span>Copy</span></>}
          </button>
        </div>
      </div>

      {/* Code body with line numbers */}
      {!collapsed && (
        <div className="code-editor-body">
          <div className="code-editor-line-numbers" aria-hidden>
            {lines.map((_, i) => (
              <div key={i} className="code-line-num">{i + 1}</div>
            ))}
          </div>
          <pre className="code-editor-pre">
            <code ref={codeRef} className={`language-${language}`}>{code}</code>
          </pre>
          {/* Animated cursor at end */}
          <div className="code-editor-cursor" />
        </div>
      )}

      {/* Collapsed state */}
      {collapsed && (
        <div className="code-editor-collapsed" onClick={() => setCollapsed(false)}>
          <Code2 size={16} />
          <span>{lineCount} lines of {language} code</span>
          <span className="code-editor-expand-hint">Click to expand</span>
        </div>
      )}

      {/* Footer bar with output preview */}
      {!collapsed && (
        <div className="code-editor-footer">
          <div className="code-editor-meta">
            <Terminal size={12} />
            <span>{lineCount} lines</span>
          </div>
          {outputLines.length > 0 && (
            <button
              className="code-editor-output-btn"
              onClick={() => setShowOutput(!showOutput)}
            >
              <Play size={12} />
              {showOutput ? 'Hide Output' : 'Show Output'}
            </button>
          )}
        </div>
      )}

      {/* Output panel */}
      {showOutput && outputLines.length > 0 && !collapsed && (
        <div className="code-editor-output">
          <div className="code-output-label">
            <Terminal size={12} /> Output
          </div>
          {outputLines.map((out, i) => (
            <div key={i} className="code-output-line">
              <span className="code-output-prompt">›</span> {out}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
