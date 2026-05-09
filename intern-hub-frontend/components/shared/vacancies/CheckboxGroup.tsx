import type { DictionaryItem } from "@/lib/api/dictionaries";

export function CheckboxGroup({
  title,
  name,
  values,
  options,
}: {
  title: string;
  name: string;
  values: string[];
  options: DictionaryItem[];
}) {
  if (!options.length) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-[#444]">{title}</legend>
      <div className="grid gap-2 text-sm text-[#444]">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              name={name}
              value={option.id}
              defaultChecked={values.includes(option.id)}
              className="h-4 w-4 rounded border-[#161616]/20"
            />
            {option.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
