"use client";

import { useEffect, useId, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import type { DictionaryItem } from "@/lib/api/dictionaries";

export function SearchableMultiFilterSelect({
  label,
  name,
  values,
  options,
}: {
  label: string;
  name: string;
  values: string[];
  options: DictionaryItem[];
}) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(values);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSelectedValues(values);
  }, [values]);

  const selectedNames = options
    .filter((option) => selectedValues.includes(option.id))
    .map((option) => option.name);
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function toggleValue(nextValue: string) {
    setSelectedValues((current) =>
      current.includes(nextValue)
        ? current.filter((value) => value !== nextValue)
        : [...current, nextValue],
    );
  }

  function clearValues() {
    setSelectedValues([]);
    setQuery("");
  }

  return (
    <div
      className="relative grid min-w-0 gap-1 text-sm font-medium text-[#444]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <label htmlFor={inputId}>{label}</label>
      {selectedValues.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}
      <button
        id={inputId}
        type="button"
        aria-expanded={open}
        className="flex min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#161616]/15 bg-white px-3 py-2 text-left text-sm text-[#171717] shadow-sm outline-none transition hover:border-[#161616]/30 focus:border-[#48644d] focus:ring-2 focus:ring-[#48644d]/15"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">
          {selectedNames.length ? selectedNames.join(", ") : "Все"}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#777]" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-[#161616]/15 bg-white shadow-[0_18px_45px_rgba(20,20,20,0.16)]">
          <div className="border-b border-[#161616]/10 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <input
                autoFocus
                value={query}
                placeholder="Поиск"
                className="h-9 w-full rounded-lg border border-[#161616]/12 bg-[#f8f7f2] pl-9 pr-3 text-sm font-normal text-[#171717] outline-none focus:border-[#48644d] focus:ring-2 focus:ring-[#48644d]/15"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                  }
                }}
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            <button
              type="button"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-normal text-[#171717] hover:bg-[#f3f0e8]"
              onClick={clearValues}
            >
              <Check
                className={
                  selectedValues.length
                    ? "h-4 w-4 shrink-0 opacity-0"
                    : "h-4 w-4 shrink-0 text-[#48644d]"
                }
              />
              <span className="min-w-0 truncate">Все</span>
            </button>

            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const selected = selectedValues.includes(option.id);

                return (
                  <button
                    key={option.id}
                    type="button"
                    className="flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-normal text-[#171717] hover:bg-[#f3f0e8]"
                    onClick={() => toggleValue(option.id)}
                  >
                    <Check
                      className={
                        selected
                          ? "h-4 w-4 shrink-0 text-[#48644d]"
                          : "h-4 w-4 shrink-0 opacity-0"
                      }
                    />
                    <span className="min-w-0 truncate">{option.name}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-center text-sm font-normal text-[#777]">
                Ничего не найдено
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
