"use client";

import { title } from "process";
import { FilterCheckboxProps, FilterCheckbox } from "../shared/FilterCheckbox";
import { useState } from "react";
import { Input } from "../ui/input";

type Item = FilterCheckboxProps;

interface Props {
  title: string;
  items: Item[];
  defaultItems?: Item[];
  limit?: number;
  loading?: number;
  searchInputPlaceholder?: string;
  showSearchLabel?: boolean;
  // onClickCheckbox?: (id: string) => void;
  defaultValue?: string[];
  selected?: Set<string>;
  name?: string;
}

export const CheckboxFiltersGroup: React.FC<Props> = ({
  title,
  items,
  defaultItems,
  limit = 5,
  showSearchLabel = false,
  loading,
  searchInputPlaceholder = "Поиск...",
  // onClickCheckbox,
  defaultValue,
  selected,
  name,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const list = showAll
    ? items.filter((item) =>
        item.text.toLowerCase().includes(searchValue.toLowerCase())
      )
    : (defaultItems || items).slice(0, limit);

  return (
    <div>
      <p className="font-bold mb-3">{title}</p>

      {showAll && showSearchLabel && (
        <div className="mb-4">
          <Input
            placeholder={searchInputPlaceholder}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 max-h-96 overflow-auto scrollbar">
        {list.map((item, index) => (
          <FilterCheckbox
            key={index}
            text={item.text}
            value={item.value}
            // checked={selected?.has(item.value)}
            // onCheckedChange={() => onClickCheckbox?.(item.value)}
            name={name}
          />
        ))}
      </div>

      {items.length > limit && (
        <div className={showAll ? "border-t border-t-neutral-100 mt-4" : ""}>
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 cursor-pointer font-medium text-blue-600 hover:text-blue-500"
          >
            {showAll ? "Скрыть" : "Показать все"}
          </button>
        </div>
      )}
      <div className="border-b mt-6"></div>
    </div>
  );
};
