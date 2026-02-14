"use client"

import { Button } from "./button";
import { ArrowUpDown, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
    onFilterChange: (key: string, value: string | null) => void;
    defaultSort?: string;
    className?: string;
}

export default function SmartFilters<T>({
    config,
    activeValues,
    onFilterChange,
    defaultSort = "createdAt-desc",
    className
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
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {/* SORT - Estilo más sólido/permanente */}
            <Select
                value={activeValues.sort || undefined}
                onValueChange={(val) => onFilterChange("sort", val)}
            >
                <SelectTrigger className="w-auto min-w-[130px] h-9 shadow-sm bg-background border-border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Ordenar" />
                    </div>
                </SelectTrigger>
                <SelectContent align="start">
                    <SelectItem value="createdAt-desc">Recientes primero</SelectItem>
                    <SelectItem value="createdAt-asc">Antiguos primero</SelectItem>
                    {config.sort?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* SEPARADOR VISUAL (Opcional, si hay filtros) */}
            {config.filters && config.filters.length > 0 && (
                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            )}

            {/* FILTROS DINÁMICOS */}
            {config.filters?.map((filterConfig) => {
                const currentValue = activeValues[filterConfig.key];
                const isActive = currentValue && currentValue !== "all";

                return (
                    <Select
                        key={filterConfig.key}
                        value={currentValue || "all"}
                        onValueChange={(val) => {
                            const valueToSend = val === "all" ? null : val;
                            onFilterChange(filterConfig.key, valueToSend);
                        }}
                    >
                        <SelectTrigger
                            className={cn(
                                "w-auto h-9 min-w-[120px] transition-all duration-200",
                                isActive
                                    ? "bg-primary/5 border-primary/50 text-primary hover:bg-primary/10"
                                    : "border-dashed bg-transparent hover:bg-accent/50 hover:border-border text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Filter className={cn("h-3.5 w-3.5", isActive ? "text-primary fill-primary/20" : "text-muted-foreground")} />
                                <span className={cn("text-sm", isActive && "font-medium")}>
                                    {isActive
                                        ? filterConfig.options.find(o => o.value === currentValue)?.label
                                        : filterConfig.label
                                    }
                                </span>
                                {isActive && (
                                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary/30">
                                        1
                                    </Badge>
                                )}
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-muted-foreground">
                                Todos
                            </SelectItem>
                            {filterConfig.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        {option.label}
                                    </div>
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
                    className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto sm:ml-0"
                >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar
                </Button>
            )}
        </div>
    );
}