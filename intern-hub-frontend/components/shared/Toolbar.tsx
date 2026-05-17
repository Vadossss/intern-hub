"use client";

import { Bold, Code, Italic, List, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";

const toolbarButtons = [
  { label: "Жирный", icon: Bold },
  { label: "Курсив", icon: Italic },
  { label: "Список", icon: List },
  { label: "Нумерованный список", icon: ListOrdered },
  { label: "Код", icon: Code },
];

export const Toolbar = () => (
  <div className="flex gap-2 mb-2" aria-label="Панель форматирования">
    {toolbarButtons.map(({ label, icon: Icon }) => (
      <Button
        key={label}
        type="button"
        variant="outline"
        size="sm"
        disabled
        aria-label={label}
      >
        <Icon size={14} />
      </Button>
    ))}
  </div>
);
