import { Checkbox } from "../ui/checkbox";
import React from "react";

export interface FilterCheckboxProps {
  text: string;
  value: string;
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
  name?: string;
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  text,
  value,
  onCheckedChange,
  checked,
  name,
}) => {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        value={value}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-5 h-5 rounded-md bg-gray-100"
        id={`checkbox-${String(name)}-${String(value)}`}
      />
      <label
        className="flex-1 cursor-pointer font-medium text-sm leading-5"
        htmlFor={`checkbox-${String(name)}-${String(value)}`}
      >
        {text}
      </label>
    </div>
  );
};
