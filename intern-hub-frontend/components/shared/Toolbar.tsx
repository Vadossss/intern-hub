"use client";

import React, { useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  INSERT_CODE_BLOCK_COMMAND,
} from "lexical";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Code, List, ListOrdered } from "lucide-react";

export const Toolbar = () => {
  const [editor] = useLexicalComposerContext();

  const format = useCallback(
    (type: string) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
    },
    [editor]
  );

  const insertUnorderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertCodeBlock = useCallback(() => {
    editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, undefined);
  }, [editor]);

  return (
    <div className="flex gap-2 mb-2">
      <Button variant="outline" size="sm" onClick={() => format("bold")}>
        <Bold size={14} />
      </Button>
      <Button variant="outline" size="sm" onClick={() => format("italic")}>
        <Italic size={14} />
      </Button>
      <Button variant="outline" size="sm" onClick={insertUnorderedList}>
        <List size={14} />
      </Button>
      <Button variant="outline" size="sm" onClick={insertOrderedList}>
        <ListOrdered size={14} />
      </Button>
      <Button variant="outline" size="sm" onClick={insertCodeBlock}>
        <Code size={14} />
      </Button>
    </div>
  );
};
