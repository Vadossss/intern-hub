"use client";

import { memo, useDeferredValue, useMemo, useState } from "react";
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
  className?: string;
}

const COLLAPSED_SKILLS_LIMIT = 48;
const EXPANDED_SKILLS_LIMIT = 160;
const SEARCH_SKILLS_LIMIT = 120;

export const SkillsSelector = memo(function SkillsSelector({
  skills,
  selectedSkillIds,
  onChange,
  name = "skills",
  className,
}: SkillsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const selectedSkillIdSet = useMemo(
    () => new Set(selectedSkillIds),
    [selectedSkillIds],
  );

  const filteredSkills = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();

    if (!query) return skills;

    return skills.filter((skill) => skill.name.toLowerCase().includes(query));
  }, [deferredSearchQuery, skills]);

  const visibleSkills = useMemo(() => {
    const query = deferredSearchQuery.trim();
    const limit = query
      ? SEARCH_SKILLS_LIMIT
      : isExpanded
        ? EXPANDED_SKILLS_LIMIT
        : COLLAPSED_SKILLS_LIMIT;

    if (query) {
      return filteredSkills.slice(0, limit);
    }

    const selectedSkills: SkillOption[] = [];
    const otherSkills: SkillOption[] = [];

    for (const skill of filteredSkills) {
      if (selectedSkillIdSet.has(skill.id)) {
        selectedSkills.push(skill);
      } else if (otherSkills.length < limit) {
        otherSkills.push(skill);
      }
    }

    return [...selectedSkills, ...otherSkills].slice(0, limit);
  }, [deferredSearchQuery, filteredSkills, isExpanded, selectedSkillIdSet]);

  const hiddenSkillsCount = Math.max(
    filteredSkills.length - visibleSkills.length,
    0,
  );

  function toggleSkill(skillId: number, checked: boolean) {
    const nextSelectedSkillIds = new Set(selectedSkillIds);

    if (checked) {
      nextSelectedSkillIds.add(skillId);
      onChange(Array.from(nextSelectedSkillIds));
      return;
    }

    nextSelectedSkillIds.delete(skillId);
    onChange(Array.from(nextSelectedSkillIds));
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4",
        className,
      )}
    >
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#171717]">Навыки</p>
          <p className="mt-1 text-xs text-[#777]">
            Выбрано: {selectedSkillIds.length}
          </p>
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3f5f4a]" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по навыкам"
            className="h-11 border-[#3f5f4a]/40 bg-white pl-10 font-semibold shadow-sm focus-visible:ring-[#3f5f4a]"
          />
        </div>
      </div>
      <div
        className={cn(
          "flex flex-wrap gap-2 overflow-y-auto pr-2 transition-[max-height]",
          isExpanded || searchQuery ? "max-h-72" : "max-h-28 overflow-hidden",
        )}
      >
        {filteredSkills.length > 0 ? (
          visibleSkills.map((skill) => (
            <label
              key={skill.id}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-[#333]"
            >
              <input
                type="checkbox"
                name={name}
                value={skill.id}
                checked={selectedSkillIdSet.has(skill.id)}
                onChange={(event) =>
                  toggleSkill(skill.id, event.target.checked)
                }
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
      {hiddenSkillsCount > 0 ? (
        <p className="mt-3 text-xs text-[#777]">
          Показано {visibleSkills.length} из {filteredSkills.length}. Введите
          текст в поиск, чтобы быстро найти нужный навык.
        </p>
      ) : null}
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
});
