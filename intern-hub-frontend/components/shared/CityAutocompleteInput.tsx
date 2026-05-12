"use client";

import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { getCitySuggestions, type CitySuggestion } from "@/lib/api/cities";
import { cn } from "@/lib/utils";

interface CityAutocompleteInputProps {
  name: string;
  defaultValue?: string | null;
  value?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
}

const MIN_QUERY_LENGTH = 1;
const DEBOUNCE_MS = 350;

function cityLabel(city: CitySuggestion) {
  return city.regionFullname && city.regionFullname !== city.name
    ? `${city.name}, ${city.regionFullname}`
    : city.name;
}

export function CityAutocompleteInput({
  name,
  defaultValue,
  value: controlledValue,
  placeholder,
  required,
  className,
  onValueChange,
}: CityAutocompleteInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const value = controlledValue ?? internalValue;
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);
  const selectedCityRef = useRef(defaultValue ?? "");

  useEffect(() => {
    selectedCityRef.current = defaultValue ?? "";
    setInternalValue(defaultValue ?? "");
  }, [defaultValue]);

  function updateValue(nextValue: string) {
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  useEffect(() => {
    const query = value.trim();
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    if (query === selectedCityRef.current.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await getCitySuggestions(query);
        if (requestIdRef.current === requestId) {
          setSuggestions(response);
          setHasSearched(true);
        }
      } catch (error) {
        console.error("Failed to load city suggestions:", error);
        if (requestIdRef.current === requestId) {
          setSuggestions([]);
          setHasSearched(true);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [value]);

  const showDropdown =
    isFocused &&
    value.trim().length >= MIN_QUERY_LENGTH &&
    (isLoading || hasSearched);

  return (
    <div className={cn("relative", className)}>
      <Input
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        onChange={(event) => {
          selectedCityRef.current = "";
          updateValue(event.target.value);
          setIsFocused(true);
        }}
        onFocus={() => setIsFocused(true)}
      />

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#161616]/10 bg-white shadow-lg">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#626262]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Поиск города...
            </div>
          ) : suggestions.length ? (
            <div className="max-h-64 overflow-y-auto py-1">
              {suggestions.map((city) => (
                <button
                  key={`${city.name}-${city.regionFullname ?? ""}`}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[#f4f1e9]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    selectedCityRef.current = city.name;
                    updateValue(city.name);
                    setIsFocused(false);
                    setHasSearched(false);
                    setSuggestions([]);
                  }}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[#626262]" />
                  <span>{cityLabel(city)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-[#626262]">
              Город не найден
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
