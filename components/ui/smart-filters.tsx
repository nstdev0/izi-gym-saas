"use client"

import { Button } from "./button";
import { ArrowUpDown, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface FilterOption {
    label: string,
    value: string
}

export interface SortOption<T> {
    label: string;
    field: keyof T;
    value: string;
}

export interface SelectFilterConfig {
    key: string,
    label: string,
    options: FilterOption[]
}

export interface FilterConfiguration<T> {
    sort?: SortOption<T>[],
    filters?: SelectFilterConfig[]
}

interface SmartFiltersProps<T> {
    config: FilterConfiguration<T>;
    activeValues: {
        sort?: string | null;
        [key: string]: any;
    };
    onFilterChange: (key: string, value: string | null) => void;
    defaultSort?: string
}

export default function SmartFilters<T>({
    config,
    activeValues,
    onFilterChange,
    defaultSort = "createdAt-desc"
}: SmartFiltersProps<T>) {
    const handleReset = () => {
        config.filters?.forEach(f => onFilterChange(f.key, null));
        onFilterChange("sort", defaultSort);
    };

    const hasActiveFilters = Object.entries(activeValues).some(
        ([key, val]) => {
            if (val === null || val === undefined || val === "" || val === "all") return false;
            if (key === "sort" && val === defaultSort) return false;
            return true;
        }
    );

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* SORT */}
            {config.sort && config.sort.length > 0 && (
                <Select
                    value={activeValues.sort || undefined}
                    onValueChange={(val) => onFilterChange("sort", val)}
                >
                    <SelectTrigger className="w-auto min-w-[140px] h-9">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Ordenar" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt-desc">Más recientes</SelectItem>
                        <SelectItem value="createdAt-asc">Más antiguos</SelectItem>
                        {config.sort.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* FILTROS DINÁMICOS */}
            {config.filters?.map((filterConfig) => {
                const currentValue = activeValues[filterConfig.key] || undefined;

                return (
                    <Select
                        key={filterConfig.key}
                        value={currentValue}
                        onValueChange={(val) => {
                            // Si selecciona "all", enviamos null para limpiar el parametro URL
                            const valueToSend = val === "all" ? null : val;
                            onFilterChange(filterConfig.key, valueToSend);
                        }}
                    >
                        <SelectTrigger className="w-auto min-w-[140px] h-9 border-dashed">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder={filterConfig.label} />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos ({filterConfig.label})</SelectItem>
                            {filterConfig.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            })}

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-9 px-2 lg:px-3"
                >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                </Button>
            )}
        </div>
    );
}