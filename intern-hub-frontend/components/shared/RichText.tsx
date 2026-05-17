"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  MessageSquareText,
  Quote,
  RemoveFormatting,
  Table2,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const allowedTags = new Set([
  "aside",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

type CommandKey =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList";

const defaultActiveCommands: Record<CommandKey, boolean> = {
  bold: false,
  italic: false,
  underline: false,
  insertUnorderedList: false,
  insertOrderedList: false,
};

type HeadingLevel = 2 | 3 | 4 | null;

const programmingLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "kotlin", label: "Kotlin" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
];

export function RichTextEditor({
  name,
  defaultValue,
  placeholder,
  className,
  onChange,
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [initialHtml] = useState(() => sanitizeRichText(defaultValue ?? ""));
  const [activeCommands, setActiveCommands] = useState(defaultActiveCommands);
  const [activeHeading, setActiveHeading] = useState<HeadingLevel>(null);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [selectedCodeText, setSelectedCodeText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [tableRows, setTableRows] = useState("3");
  const [tableColumns, setTableColumns] = useState("3");

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialHtml;
      syncValue();
    }

    document.addEventListener("selectionchange", updateActiveCommands);

    return () => {
      document.removeEventListener("selectionchange", updateActiveCommands);
    };
  }, []);

  function runCommand(command: CommandKey) {
    editorRef.current?.focus();
    document.execCommand(command);
    syncValue();
    updateActiveCommands();
  }

  function insertHtml(html: string, restoreRange = false) {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();
    if (restoreRange) {
      restoreSavedRange(editor);
    }
    document.execCommand("insertHTML", false, html);
    savedRangeRef.current = null;
    syncValue();
    updateActiveCommands();
  }

  function openCodeDialog() {
    saveCurrentRange();
    setSelectedCodeText(getSelectedText(editorRef.current) || "// Ваш код");
    setCodeDialogOpen(true);
  }

  function openTableDialog() {
    saveCurrentRange();
    setTableDialogOpen(true);
  }

  function saveCurrentRange() {
    savedRangeRef.current = getEditorRange(editorRef.current);
  }

  function restoreSavedRange(editor: HTMLDivElement) {
    const selection = document.getSelection();
    const range = savedRangeRef.current;

    if (!selection) {
      return;
    }

    selection.removeAllRanges();

    if (range && isRangeInsideEditor(editor, range)) {
      selection.addRange(range);
      return;
    }

    const fallbackRange = document.createRange();
    fallbackRange.selectNodeContents(editor);
    fallbackRange.collapse(false);
    selection.addRange(fallbackRange);
  }

  function insertCodeBlock() {
    insertHtml(
      `<pre data-language="${escapeAttribute(selectedLanguage)}"><code>${escapeHtml(
        selectedCodeText || "// Ваш код",
      )}</code></pre><p><br /></p>`,
      true,
    );
    setCodeDialogOpen(false);
  }

  function insertQuoteBlock() {
    const selectedText = getSelectedText(editorRef.current) || "Текст цитаты";

    insertHtml(`<blockquote>${escapeHtml(selectedText)}</blockquote><p><br /></p>`);
  }

  function insertNoteBlock() {
    const selectedText =
      getSelectedText(editorRef.current) || "Важное примечание к статье";

    insertHtml(
      `<aside data-type="note"><strong>Примечание:</strong><p>${escapeHtml(
        selectedText,
      )}</p></aside><p><br /></p>`,
    );
  }

  function insertTable() {
    const rowCount = clampPositive(Number(tableRows), 1, 12);
    const columnCount = clampPositive(Number(tableColumns), 1, 8);
    const headCells = Array.from(
      { length: columnCount },
      (_, index) => `<th>Заголовок ${index + 1}</th>`,
    ).join("");
    const bodyRows = Array.from({ length: rowCount }, () => {
      const cells = Array.from(
        { length: columnCount },
        () => "<td>Текст</td>",
      ).join("");

      return `<tr>${cells}</tr>`;
    }).join("");

    insertHtml(
      `<table><thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody></table><p><br /></p>`,
      true,
    );
    setTableDialogOpen(false);
  }

  function insertHeading(level: 2 | 3 | 4) {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();
    const currentBlock = getCurrentEditableBlock(editor);
    const currentHeading = getClosestBlockTag(editor);
    const headingTag = `h${level}` as "h2" | "h3" | "h4";
    const nextBlock: "p" | "h2" | "h3" | "h4" =
      currentHeading === headingTag ? "p" : headingTag;

    if (currentBlock) {
      const nextElement = replaceBlockTag(currentBlock, nextBlock);
      placeCaretAtEnd(nextElement);
    } else {
      const selectedText = getSelectedText(editor);

      insertHtml(
        `<${nextBlock}>${selectedText ? escapeHtml(selectedText) : "<br />"}</${nextBlock}>`,
      );
      return;
    }

    syncValue();
    updateActiveCommands();
  }

  function clearFormatting() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();
    const currentBlock = getCurrentEditableBlock(editor);
    document.execCommand("removeFormat");

    if (document.queryCommandState("insertUnorderedList")) {
      document.execCommand("insertUnorderedList");
    }

    if (document.queryCommandState("insertOrderedList")) {
      document.execCommand("insertOrderedList");
    }

    if (currentBlock?.isConnected && /^H[2-4]$/.test(currentBlock.tagName)) {
      const nextElement = replaceBlockTag(currentBlock, "p");
      placeCaretAtEnd(nextElement);
    }

    syncValue();
    updateActiveCommands();
  }

  function syncValue() {
    if (!inputRef.current) return;

    const value = sanitizeRichText(editorRef.current?.innerHTML ?? "");
    inputRef.current.value = value;
    onChange?.(value);
  }

  function updateActiveCommands() {
    const editor = editorRef.current;
    const selection = document.getSelection();

    if (!editor || !selection?.anchorNode) {
      setActiveCommands(defaultActiveCommands);
      return;
    }

    if (!editor.contains(selection.anchorNode)) {
      return;
    }

    setActiveCommands({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
    setActiveHeading(readActiveHeading(editor));
  }

  return (
    <div className={cn("rounded-2xl border border-[#161616]/10 bg-white", className)}>
      <div className="sticky top-16 z-40 flex flex-wrap gap-1 rounded-t-2xl border-b border-[#161616]/10 bg-white/95 p-2 shadow-sm backdrop-blur">
        <ToolbarButton
          label="Жирный"
          active={activeCommands.bold}
          onClick={() => runCommand("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Курсив"
          active={activeCommands.italic}
          onClick={() => runCommand("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Подчеркнутый"
          active={activeCommands.underline}
          onClick={() => runCommand("underline")}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Очистить форматирование" onClick={clearFormatting}>
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Список"
          active={activeCommands.insertUnorderedList}
          onClick={() => runCommand("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Нумерованный список"
          active={activeCommands.insertOrderedList}
          onClick={() => runCommand("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton
          label="Заголовок 1"
          active={activeHeading === 2}
          onClick={() => insertHeading(2)}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Заголовок 2"
          active={activeHeading === 3}
          onClick={() => insertHeading(3)}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Заголовок 3"
          active={activeHeading === 4}
          onClick={() => insertHeading(4)}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Код" onClick={openCodeDialog}>
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Таблица" onClick={openTableDialog}>
          <Table2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Цитата" onClick={insertQuoteBlock}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Примечание" onClick={insertNoteBlock}>
          <MessageSquareText className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "min-h-36 rounded-b-2xl px-4 py-3 text-sm leading-7 text-[#333] outline-none",
          "[&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-[#171717]",
          "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:text-[#171717]",
          "[&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-lg [&_h4]:font-extrabold [&_h4]:leading-tight [&_h4]:text-[#171717]",
          "[&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc",
          "[&_li]:pl-1 [&_strong]:font-extrabold [&_b]:font-extrabold",
          "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#3f5f4a] [&_blockquote]:bg-[#f4f7f1] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:font-semibold",
          "[&_aside[data-type='note']]:my-4 [&_aside[data-type='note']]:rounded-xl [&_aside[data-type='note']]:border [&_aside[data-type='note']]:border-amber-200 [&_aside[data-type='note']]:bg-amber-50 [&_aside[data-type='note']]:p-4",
          "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#171717] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-white",
          "[&_code]:font-mono",
          "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl",
          "[&_td]:border [&_td]:border-[#d8d5cc] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[#d8d5cc] [&_th]:bg-[#edf3ea] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left",
          "empty:before:pointer-events-none empty:before:text-[#9a9a9a] empty:before:content-[attr(data-placeholder)]",
        )}
        data-placeholder={placeholder}
        onInput={syncValue}
        onBlur={syncValue}
        onKeyUp={updateActiveCommands}
        onMouseUp={updateActiveCommands}
      />
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        defaultValue={initialHtml}
      />
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Выберите язык программирования</DialogTitle>
            <DialogDescription>
              Код сохранится как HTML-блок и будет подсвечен на странице статьи.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {programmingLanguages.map((language) => (
              <button
                key={language.value}
                type="button"
                className={cn(
                  "rounded-xl border px-3 py-2 text-left text-sm font-bold transition",
                  selectedLanguage === language.value
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-[#161616]/10 bg-white text-[#333] hover:bg-[#f4f1e9]",
                )}
                onClick={() => setSelectedLanguage(language.value)}
              >
                {language.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setCodeDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[#171717] text-white"
              onClick={insertCodeBlock}
            >
              Вставить код
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Параметры таблицы</DialogTitle>
            <DialogDescription>
              Укажите количество строк и столбцов, затем заполните таблицу в редакторе.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-[#333]">
              Строки
              <Input
                type="number"
                min={1}
                max={12}
                value={tableRows}
                onChange={(event) => setTableRows(event.target.value)}
                onBlur={() =>
                  setTableRows(String(clampPositive(Number(tableRows), 1, 12)))
                }
                className="rounded-xl"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-[#333]">
              Столбцы
              <Input
                type="number"
                min={1}
                max={8}
                value={tableColumns}
                onChange={(event) => setTableColumns(event.target.value)}
                onBlur={() =>
                  setTableColumns(
                    String(clampPositive(Number(tableColumns), 1, 8)),
                  )
                }
                className="rounded-xl"
              />
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setTableDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[#171717] text-white"
              onClick={insertTable}
            >
              Вставить таблицу
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RichTextContent({
  value,
  fallback = "Описание пока не заполнено.",
  className,
}: {
  value?: string | null;
  fallback?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const html = useMemo(
    () => sanitizeRichText(value || fallback),
    [fallback, value],
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const blocks = Array.from(container.querySelectorAll("pre"));

    blocks.forEach((block) => {
      highlightCodeBlock(block);

      if (block.closest(".rich-code-frame")) {
        return;
      }

      const frame = document.createElement("div");
      frame.className = "rich-code-frame";

      const toolbar = document.createElement("div");
      toolbar.className = "rich-code-toolbar";

      const language = document.createElement("span");
      language.textContent = block.dataset.language || "text";

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "rich-code-copy";
      copyButton.textContent = "Копировать";
      copyButton.addEventListener("click", async () => {
        await copyText(block.innerText);
        copyButton.textContent = "Скопировано";
        window.setTimeout(() => {
          copyButton.textContent = "Копировать";
        }, 1500);
      });

      toolbar.append(language, copyButton);
      block.parentNode?.insertBefore(frame, block);
      frame.append(toolbar, block);
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "rich-text-content text-sm leading-7 text-[#4d4d4d]",
        "[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:leading-tight [&_h2]:text-[#171717]",
        "[&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-2xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:text-[#171717]",
        "[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-xl [&_h4]:font-extrabold [&_h4]:leading-tight [&_h4]:text-[#171717]",
        "[&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc",
        "[&_li]:pl-1 [&_strong]:font-extrabold [&_b]:font-extrabold",
        "[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#3f5f4a] [&_blockquote]:bg-[#f4f7f1] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:text-[#27382c]",
        "[&_aside[data-type='note']]:my-5 [&_aside[data-type='note']]:rounded-xl [&_aside[data-type='note']]:border [&_aside[data-type='note']]:border-amber-200 [&_aside[data-type='note']]:bg-amber-50 [&_aside[data-type='note']]:p-5 [&_aside[data-type='note']]:text-amber-950",
        "[&_.rich-code-frame]:my-5 [&_.rich-code-frame]:overflow-hidden [&_.rich-code-frame]:rounded-xl [&_.rich-code-frame]:border [&_.rich-code-frame]:border-[#171717]/15 [&_.rich-code-frame]:bg-[#171717]",
        "[&_.rich-code-toolbar]:flex [&_.rich-code-toolbar]:items-center [&_.rich-code-toolbar]:justify-between [&_.rich-code-toolbar]:border-b [&_.rich-code-toolbar]:border-white/10 [&_.rich-code-toolbar]:px-4 [&_.rich-code-toolbar]:py-2 [&_.rich-code-toolbar]:text-xs [&_.rich-code-toolbar]:font-bold [&_.rich-code-toolbar]:uppercase [&_.rich-code-toolbar]:tracking-[0.12em] [&_.rich-code-toolbar]:text-white/60",
        "[&_.rich-code-copy]:rounded-lg [&_.rich-code-copy]:bg-white/10 [&_.rich-code-copy]:px-3 [&_.rich-code-copy]:py-1.5 [&_.rich-code-copy]:text-[11px] [&_.rich-code-copy]:font-extrabold [&_.rich-code-copy]:normal-case [&_.rich-code-copy]:tracking-normal [&_.rich-code-copy]:text-white [&_.rich-code-copy]:transition hover:[&_.rich-code-copy]:bg-white/20",
        "[&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-white",
        "[&_code]:font-mono",
        "[&_.rich-code-comment]:text-[#7f8c98] [&_.rich-code-keyword]:font-bold [&_.rich-code-keyword]:text-[#ff7ab6] [&_.rich-code-number]:text-[#f8c555] [&_.rich-code-string]:text-[#7ee787] [&_.rich-code-type]:text-[#79c0ff]",
        "[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:text-sm",
        "[&_td]:border [&_td]:border-[#d8d5cc] [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-[#d8d5cc] [&_th]:bg-[#edf3ea] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-extrabold [&_tr:nth-child(even)_td]:bg-[#faf9f5]",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function sanitizeRichText(value: string) {
  const hasTags = /<[^>]+>/.test(value);
  const input = hasTags ? value : escapeHtml(value).replace(/\n/g, "<br />");

  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tagName: string) => {
      const tag = tagName.toLowerCase();

      if (!allowedTags.has(tag)) {
        return "";
      }

      if (tag === "br") {
        return "<br />";
      }

      if (match.startsWith("</")) {
        return `</${tag}>`;
      }

      return buildAllowedOpeningTag(match, tag);
    })
    .trim();
}

function ToolbarButton({
  label,
  active = false,
  children,
  onClick,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-9 w-9 rounded-lg p-0",
        active
          ? "bg-[#171717] text-white hover:bg-[#171717] hover:text-white"
          : "text-[#555] hover:bg-[#f2f2ed] hover:text-[#171717]",
      )}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-9 w-px bg-[#161616]/10" />;
}

function getSelectedText(editor: HTMLDivElement | null) {
  const selection = document.getSelection();

  if (!editor || !selection?.anchorNode || !editor.contains(selection.anchorNode)) {
    return "";
  }

  return selection.toString();
}

function getEditorRange(editor: HTMLDivElement | null) {
  const selection = document.getSelection();

  if (!editor || !selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  if (
    !editor.contains(range.commonAncestorContainer) &&
    range.commonAncestorContainer !== editor
  ) {
    return null;
  }

  return range.cloneRange();
}

function isRangeInsideEditor(editor: HTMLDivElement, range: Range) {
  return (
    editor.contains(range.commonAncestorContainer) ||
    range.commonAncestorContainer === editor
  );
}

function getClosestBlockTag(editor: HTMLDivElement) {
  const selection = document.getSelection();
  let node = selection?.anchorNode ?? null;

  while (node && node !== editor) {
    if (node instanceof HTMLElement && /^H[2-4]$/.test(node.tagName)) {
      return node.tagName.toLowerCase();
    }

    node = node.parentNode;
  }

  return null;
}

function getCurrentEditableBlock(editor: HTMLDivElement) {
  const selection = document.getSelection();
  let node = selection?.anchorNode ?? null;

  while (node && node !== editor) {
    if (
      node instanceof HTMLElement &&
      /^(P|DIV|H2|H3|H4|BLOCKQUOTE)$/.test(node.tagName)
    ) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
}

function replaceBlockTag(block: HTMLElement, tagName: "p" | "h2" | "h3" | "h4") {
  const replacement = block.ownerDocument.createElement(tagName);

  while (block.firstChild) {
    replacement.append(block.firstChild);
  }

  block.replaceWith(replacement);
  return replacement;
}

function placeCaretAtEnd(element: HTMLElement) {
  const selection = element.ownerDocument.getSelection();

  if (!selection) {
    return;
  }

  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function readActiveHeading(editor: HTMLDivElement): HeadingLevel {
  const tag = getClosestBlockTag(editor);

  if (tag === "h2") {
    return 2;
  }

  if (tag === "h3") {
    return 3;
  }

  if (tag === "h4") {
    return 4;
  }

  return null;
}

function clampPositive(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(Math.floor(value), min), max);
}

function buildAllowedOpeningTag(match: string, tag: string) {
  const attrs: string[] = [];

  if (tag === "pre") {
    const language = readAttribute(match, "data-language");

    if (language) {
      attrs.push(`data-language="${escapeAttribute(language)}"`);
    }
  }

  if (tag === "aside") {
    const type = readAttribute(match, "data-type");

    if (type === "note") {
      attrs.push('data-type="note"');
    }
  }

  return attrs.length ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
}

function readAttribute(tag: string, attribute: string) {
  const pattern = new RegExp(`${attribute}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(pattern);

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function highlightCodeBlock(block: HTMLPreElement) {
  const code = block.querySelector("code");

  if (!code) {
    return;
  }

  const language = block.dataset.language || "text";
  code.innerHTML = highlightCode(code.textContent ?? "", language);
}

function highlightCode(value: string, language: string) {
  const escaped = escapeHtml(value);
  const normalizedLanguage = language.toLowerCase();
  const placeholders: Record<string, string> = {};
  const keywordPattern =
    normalizedLanguage === "sql"
      ? /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|INSERT|INTO|UPDATE|DELETE|CREATE|TABLE|ALTER|DROP|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|VALUES|SET|AND|OR|NOT|NULL|AS|ON)\b/g
      : /\b(abstract|async|await|break|case|catch|class|const|continue|data|def|default|do|else|enum|export|extends|final|finally|for|fun|function|go|if|import|in|interface|let|new|null|object|package|private|protected|public|return|static|struct|switch|this|throw|try|type|val|var|void|while|yield)\b/g;
  const typePattern =
    /\b(Array|Boolean|Date|Double|Exception|Float|HashMap|Integer|List|Map|Number|Object|Promise|Result|Set|String|Void|boolean|char|double|float|int|long|string)\b/g;

  function stash(className: string, text: string) {
    const token = `RICHCODE${toAlphaToken(Object.keys(placeholders).length)}TOKEN`;
    placeholders[token] = `<span class="${className}">${text}</span>`;
    return token;
  }

  return escaped
    .replace(/(&quot;.*?&quot;|&#039;.*?&#039;|`.*?`)/g, (text) =>
      stash("rich-code-string", text),
    )
    .replace(/(\/\/.*?$|#.*?$|--.*?$)/gm, (text) =>
      stash("rich-code-comment", text),
    )
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="rich-code-number">$1</span>')
    .replace(typePattern, '<span class="rich-code-type">$1</span>')
    .replace(keywordPattern, '<span class="rich-code-keyword">$1</span>')
    .replace(/RICHCODE[A-Z]+TOKEN/g, (token) => placeholders[token] ?? "");
}

function toAlphaToken(index: number) {
  let value = "";
  let current = index;

  do {
    value = String.fromCharCode(65 + (current % 26)) + value;
    current = Math.floor(current / 26) - 1;
  } while (current >= 0);

  return value;
}

function escapeAttribute(value: string) {
  return value.replace(/[<>"'`]/g, "").slice(0, 40);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
