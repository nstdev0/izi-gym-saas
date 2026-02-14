"use client";

import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import { Input } from "./input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSearch = useDebouncedCallback((term: string) => {
    onChange(term);
  }, 350);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    handleSearch(newValue);
  };

  return (
    <div className={cn("relative group transition-all duration-200")}>
      <Search
        className={cn(
          "absolute left-3 top-2.5 w-4 h-4 transition-colors duration-200",
          isFocused ? "text-primary" : "text-muted-foreground group-hover:text-foreground/70"
        )}
      />
      <Input
        placeholder={placeholder}
        className={cn(
          "pl-9 bg-background/50 border-muted-foreground/20 shadow-sm transition-all duration-200",
          "focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50",
          "hover:border-muted-foreground/40 hover:bg-background"
        )}
        value={localValue}
        onChange={onInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
}