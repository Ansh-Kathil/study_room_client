"use client";

import React, { useState } from "react";
import { Check, Copy, Clock, Database, Sparkles, AlertCircle, Info, ChevronRight, Terminal } from "lucide-react";

/**
 * FormattedAIMessage
 * Renders structured, beautiful AI Coach responses:
 * - Code blocks with copy buttons
 * - Styled Big-O complexity badges
 * - Visual headers for hints, bug analysis, complexity, and recommendations
 * - Bullet lists & edge cases
 * - Note/Tip callout boxes
 */
export default function FormattedAIMessage({ content }) {
  const [copiedSnippetId, setCopiedSnippetId] = useState(null);

  if (!content) return null;

  // Handle snippet copying
  const copySnippet = (codeText, id) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Helper to render inline markdown (bold, inline code, Big-O badges, math cleanup)
  const renderInlineTokens = (text) => {
    if (!text) return null;

    // Clean up raw LaTeX math wrappers: $O(...) -> O(...)
    let cleaned = text.replace(/\$([^\$]+)\$/g, "$1");
    // Clean up \log -> log
    cleaned = cleaned.replace(/\\log/g, "log");

    // Tokenize text into:
    // 1. Inline code: `code`
    // 2. Bold text: **bold**
    // 3. Big-O notations: O(1), O(N), O(N^2), etc.
    const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|O\([^)]+\)|O\(N²\))/g;
    const parts = cleaned.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Inline code
      if (part.startsWith("`") && part.endsWith("`")) {
        const codeInner = part.slice(1, -1);
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-950 text-amber-300 font-mono text-[11px] border border-slate-800"
          >
            {codeInner}
          </code>
        );
      }

      // Bold text
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldInner = part.slice(2, -2).trim();

        // Check if bold text is a Big-O complexity tag (e.g. **O(N)** or **O(N²)**)
        if (/^O\(.+\)$/i.test(boldInner) || /^O\(N²\)$/i.test(boldInner)) {
          return renderBigOBadge(boldInner, idx);
        }

        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {boldInner}
          </strong>
        );
      }

      // Standalone Big-O notation
      if (/^O\([a-zA-Z0-9_\s\^²log\+\*]+\)$/i.test(part)) {
        return renderBigOBadge(part, idx);
      }

      return <span key={idx}>{part}</span>;
    });
  };

  // Helper to render Big-O badges with distinct visual indicators
  const renderBigOBadge = (notation, key) => {
    const norm = notation.toLowerCase().replace(/\s+/g, "");
    let colorClasses = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    let label = "";

    if (norm.includes("n^2") || norm.includes("n²") || norm.includes("n^3")) {
      colorClasses = "bg-rose-500/15 text-rose-300 border-rose-500/30";
      label = "Quadratic / Warning";
    } else if (norm.includes("2^n") || norm.includes("n!")) {
      colorClasses = "bg-rose-600/20 text-rose-300 border-rose-500/40";
      label = "Exponential";
    } else if (norm.includes("log") || norm.includes("nlogn")) {
      colorClasses = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      label = "Efficient";
    } else if (norm.includes("1") || norm.includes("(n)") || norm === "o(n)") {
      colorClasses = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      label = "Optimal";
    }

    return (
      <span
        key={key}
        className={`inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md text-[11px] font-mono font-bold border shadow-xs ${colorClasses}`}
        title={label}
      >
        <span>{notation}</span>
        {label && <span className="text-[9px] font-normal opacity-70">({label})</span>}
      </span>
    );
  };

  // Separate content into blocks: Code Blocks (```) vs Text Lines
  const blocks = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }
    blocks.push({
      type: "code",
      language: match[1] || "code",
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  return (
    <div className="space-y-3 font-sans text-xs leading-relaxed select-text">
      {blocks.map((block, bIdx) => {
        if (block.type === "code") {
          const snippetId = `snippet-${bIdx}`;
          return (
            <div
              key={bIdx}
              className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 my-2 shadow-inner"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  {block.language}
                </span>
                <button
                  type="button"
                  onClick={() => copySnippet(block.content, snippetId)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition text-[10px]"
                >
                  {copiedSnippetId === snippetId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto custom-scrollbar leading-relaxed">
                {block.content}
              </pre>
            </div>
          );
        }

        // Parse text lines into headers, tips, complexity rows, and bullets
        const lines = block.content.split("\n");
        return (
          <div key={bIdx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Notice / Tip Box: *(Tip: ...)* or *(Note: ...)*
              if (
                (trimmed.startsWith("*(") || trimmed.startsWith("(")) &&
                trimmed.endsWith(")*")
              ) {
                const innerTip = trimmed.replace(/^\*\(/, "").replace(/\)\*$/, "").replace(/^\(/, "").replace(/\)$/, "");
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 text-[11px] italic"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">{renderInlineTokens(innerTip)}</div>
                  </div>
                );
              }

              // Major headers (e.g., ⏱️ Complexity, 💡 Hint, 🧠 Strategy, ⚠️ Edge Cases, 🔍 Bug Analysis)
              if (
                /^(⏱️|💡|🧠|⚠️|🔍|🤖|###|##)/.test(trimmed) ||
                (trimmed.startsWith("**") && trimmed.endsWith("**:") && trimmed.length < 80)
              ) {
                return (
                  <div
                    key={lIdx}
                    className="pt-1.5 pb-1 flex items-center gap-1.5 font-bold text-slate-100 text-xs tracking-wide border-b border-slate-800/80"
                  >
                    {renderInlineTokens(trimmed)}
                  </div>
                );
              }

              // Sub-bullets (Indented - or •)
              const isIndented = line.startsWith("  ") || line.startsWith("\t");
              if (isIndented && (trimmed.startsWith("-") || trimmed.startsWith("•") || /^\d+\./.test(trimmed))) {
                const subContent = trimmed.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "");
                return (
                  <div
                    key={lIdx}
                    className="ml-5 flex items-start gap-2 text-[11px] text-slate-400 leading-normal"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-1.5" />
                    <div className="flex-1">{renderInlineTokens(subContent)}</div>
                  </div>
                );
              }

              // Top-level bullet items (•, -, *, or 1.)
              if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\./.test(trimmed)) {
                const bulletContent = trimmed.replace(/^[•\-\*]\s*/, "").replace(/^\d+\.\s*/, "");

                // Check if this bullet is Time or Space complexity
                const isTimeComp = /estimated time complexity/i.test(bulletContent);
                const isSpaceComp = /estimated space complexity/i.test(bulletContent);

                if (isTimeComp || isSpaceComp) {
                  return (
                    <div
                      key={lIdx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 font-medium text-slate-300">
                        {isTimeComp ? (
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        <span>{isTimeComp ? "Estimated Time Complexity:" : "Estimated Space Complexity:"}</span>
                      </div>
                      <div>
                        {renderInlineTokens(
                          bulletContent.replace(/.*estimated\s+(time|space)\s+complexity\s*[:*]*/i, "").trim()
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={lIdx} className="flex items-start gap-2 text-slate-300">
                    <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">{renderInlineTokens(bulletContent)}</div>
                  </div>
                );
              }

              // Regular paragraph line
              return (
                <div key={lIdx} className="text-slate-300">
                  {renderInlineTokens(trimmed)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
