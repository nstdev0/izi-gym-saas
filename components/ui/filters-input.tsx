"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "./button";
import { ArrowUpDown, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface UiSortOption<T> {
    label: string;
    field: keyof T;
    direction: 'asc' | 'desc';
    value: string;
}

interface FiltersInputProps<T> {
    sortOptions: UiSortOption<T>[];
    defaultSort?: string; // Opcional: para saber qué mostrar si no hay URL params
}

export default function FiltersInput<T>({
    sortOptions,
    defaultSort = "createdAt-desc"
}: FiltersInputProps<T>) {
    const router = useRouter()
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get("sort") || defaultSort

    const createQueryString = useCallback((name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("page")
        params.set(name, value)
        return params.toString()
    }, [searchParams])

    const handleSortChange = (value: string) => {
        router.push(`${pathname}?${createQueryString("sort", value)}`, { scroll: false })
    }

    // Opcional: Función para limpiar filtros
    const clearFilters = () => {
        router.push(pathname)
    }

    return (
        <div className="flex items-center gap-2">
            {/* Controlado: value={currentSort} */}
            <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] h-9">
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Ordenar por" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {/* Opciones estáticas comunes */}
                    <SelectItem value="createdAt-desc">Más recientes</SelectItem>
                    <SelectItem value="createdAt-asc">Más antiguos</SelectItem>

                    {/* Opciones dinámicas inyectadas */}
                    {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Botón visual (Reset o Acción adicional) */}
            {(searchParams.toString().length > 0) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-2 text-muted-foreground hover:text-foreground"
                >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                </Button>
            )}
        </div>
    )
}