"use client";

import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import { Input } from "./input";
import { useEffect, useState } from "react";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

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
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        value={localValue}
        onChange={onInputChange}
      />
    </div>
  );
}