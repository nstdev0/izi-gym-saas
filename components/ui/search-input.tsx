"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search } from "lucide-react";
import { Input } from "./input";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Espera 350ms después de que el usuario deje de escribir
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    // Si escribe algo, reseteamos el page
    params.delete("page");

    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    // replace actualiza la URL sin agregar una entrada al historial (UX suave)
    router.replace(`${pathname}?${params.toString()}`);
  }, 350);

  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("search")?.toString()}
      />
    </div>
  );
}
