"use client";

import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

const extensions = [TextStyleKit, StarterKit];

function MenuBar({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isStrike: ctx.editor.isActive("strike") ?? false,
      canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
      isCode: ctx.editor.isActive("code") ?? false,
      canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
    }),
  });

  const btnClass = (active?: boolean) =>
    `px-3 py-1 rounded border text-sm transition ${
      active
        ? "bg-blue-600 text-white border-blue-700"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        className={btnClass(editorState.isBold)}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        className={btnClass(editorState.isItalic)}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        className={btnClass(editorState.isStrike)}
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        className={btnClass(editorState.isCode)}
      >
        Code
      </button>
    </div>
  );
}

export default function TextEditor() {
  const editor = useEditor({
    extensions,
    content: `
      <p>Напишите текст здесь...</p>
    `,
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <MenuBar editor={editor} />
      <div className="border rounded-lg p-4 min-h-[200px] bg-white shadow-sm">
        <EditorContent editor={editor} className="w-full outline-none" />
      </div>
    </div>
  );
}
