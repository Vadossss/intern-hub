import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";

type CodeViewerProps = {
  code: string;
  language?: "jsx" | "js" | "ts" | "tsx";
  showLineNumbers?: boolean;
  initialExpanded?: boolean;
  title?: string;
};

// Простая подсветка синтаксиса для JSX/TSX — не заменяет полноценный парсер,
// но даёт аккуратный результат для демонстрационных целей.
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightJSX(raw: string) {
  const escaped = escapeHtml(raw);

  // Комментарии
  let out = escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;|\/\*[^]*?\*\/|\/\/.*?$)/gm,
    (m) => {
      return `<span class=\"token-comment\">${m}</span>`;
    }
  );

  // Строки
  out = out.replace(/(\".*?\"|'.*?'|`.*?`)/gms, (m) => {
    return `<span class=\"token-string\">${m}</span>`;
  });

  // JSX теги — имя тега
  out = out.replace(/(&lt;\/?)([A-Za-z0-9_.$:-]+)/g, (_m, p1, p2) => {
    return `${p1}<span class=\"token-tag\">${p2}</span>`;
  });

  // атрибуты
  out = out.replace(/([A-Za-z_:][-A-Za-z0-9_:.]*)(=)/g, (_m, p1, p2) => {
    return `<span class=\"token-attr\">${p1}</span>${p2}`;
  });

  // Ключевые слова JS/TS
  out = out.replace(
    /\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|extends|new|async|await|try|catch|switch|case|break|continue|throw)\b/g,
    (m) => {
      return `<span class=\"token-keyword\">${m}</span>`;
    }
  );

  // Числа
  out = out.replace(/\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/g, (m) => {
    return `<span class=\"token-number\">${m}</span>`;
  });

  return out;
}

export default function CodeViewer({
  code,
  language = "jsx",
  showLineNumbers = true,
  initialExpanded = true,
  title,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(initialExpanded);

  const highlighted = useMemo(() => highlightJSX(code), [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      // fallback: ничего не делаем
      console.error("Copy failed", e);
    }
  };

  const lines = code.split(/\r?\n/);

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="text-sm font-medium">
            {title ?? `Код (${language.toUpperCase()})`}
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            <Copy size={14} />
            {copied ? "Скопировано" : "Копировать"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded((s) => !s)}
          >
            {expanded ? (
              <div className="flex items-center gap-2">
                <ChevronUp size={14} /> Свернуть
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ChevronDown size={14} /> Развернуть
              </div>
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-0 overflow-auto">
          <div className="relative bg-slate-900/90 text-slate-50 font-sans text-sm">
            <pre className="m-0 p-4 min-w-full">
              <code className="block whitespace-pre">
                <div className="flex">
                  {showLineNumbers && (
                    <div className="select-none text-right pr-4 opacity-60 tabular-nums">
                      {lines.map((_, i) => (
                        <div key={i} className="leading-5 h-5">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex-1 leading-5">
                    {/* Подсвеченный HTML вставляем как HTML */}
                    <div
                      className="token-container"
                      style={{ whiteSpace: "pre" }}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </div>
                </div>
              </code>
            </pre>

            {/* Локальные стили подсветки — используем tailwind-совместимые классы + небольшие правила */}
            <style jsx>{`
              .token-comment {
                color: #6b7280;
                font-style: italic;
              }
              .token-string {
                color: #f59e0b;
              }
              .token-tag {
                color: #60a5fa;
              }
              .token-attr {
                color: #34d399;
              }
              .token-keyword {
                color: #f472b6;
                font-weight: 600;
              }
              .token-number {
                color: #a78bfa;
              }
              .token-container {
                display: inline-block;
              }
            `}</style>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
