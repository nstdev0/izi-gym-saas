"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import { Input } from "./input";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Espera 300ms después de que el usuario deje de escribir
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    // Si escribe algo, reseteamos a la página 1
    params.set("page", "1");

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    // replace actualiza la URL sin agregar una entrada al historial (UX suave)
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
    </div>
  );
}
