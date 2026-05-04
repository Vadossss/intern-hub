"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SkillOption } from "@/lib/api/dictionaries";
import { cn } from "@/lib/utils";

interface SkillsSelectorProps {
  skills: SkillOption[];
  selectedSkillIds: number[];
  onChange: (ids: number[]) => void;
  name?: string;
}

export function SkillsSelector({
  skills,
  selectedSkillIds,
  onChange,
  name = "skills",
}: SkillsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return skills;

    return skills.filter((skill) => skill.name.toLowerCase().includes(query));
  }, [skills, searchQuery]);

  function toggleSkill(skillId: number, checked: boolean) {
    if (checked) {
      onChange(
        selectedSkillIds.includes(skillId)
          ? selectedSkillIds
          : [...selectedSkillIds, skillId],
      );
      return;
    }

    onChange(selectedSkillIds.filter((id) => id !== skillId));
  }

  return (
    <div className="rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4">
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#171717]">Навыки</p>
          <p className="mt-1 text-xs text-[#777]">
            Выбрано: {selectedSkillIds.length}
          </p>
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по навыкам"
            className="pl-9"
          />
        </div>
      </div>
      <div
        className={cn(
          "flex flex-wrap gap-2 transition-[max-height]",
          isExpanded || searchQuery
            ? "max-h-[560px] overflow-auto"
            : "max-h-28 overflow-hidden",
        )}
      >
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => (
            <label
              key={skill.id}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-[#333]"
            >
              <input
                type="checkbox"
                name={name}
                value={skill.id}
                checked={selectedSkillIds.includes(skill.id)}
                onChange={(event) => toggleSkill(skill.id, event.target.checked)}
                className="h-4 w-4"
              />
              {skill.name}
            </label>
          ))
        ) : (
          <p className="text-sm text-[#777]">
            {skills.length > 0
              ? "По этому запросу навыки не найдены."
              : "Навыки не загрузились или пока не добавлены на бэкенде."}
          </p>
        )}
      </div>
      {skills.length > 0 && !searchQuery ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 rounded-xl"
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {isExpanded ? "Свернуть навыки" : "Показать все навыки"}
        </Button>
      ) : null}
    </div>
  );
}
