"use client"

import { useMemo, useCallback } from "react";
import { Button } from "./button";
import { ArrowUpDown, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface FilterOption {
    label: string;
    value: string;
}

export interface SortOption {
    label: string;
    value: string;
}

export interface SelectFilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
}

export interface FilterConfiguration {
    sort?: SortOption[];
    filters?: SelectFilterConfig[];
}

type ActiveValues = Record<string, string | null | undefined>;

interface SmartFiltersProps {
    config: FilterConfiguration;
    activeValues: ActiveValues;
    onFilterChange: (key: string, value: string | null) => void;
    defaultSort?: string;
    className?: string;
}

// ────────────────────────────────────────────────────────────────
// Subcomponents
// ────────────────────────────────────────────────────────────────

function SortSelect({
    options,
    value,
    defaultSort,
    onChange,
}: {
    options: SortOption[];
    value: string | null | undefined;
    defaultSort: string;
    onChange: (value: string) => void;
}) {
    if (options.length === 0) return null;

    return (
        <Select
            value={value ?? defaultSort}
            onValueChange={onChange}
        >
            <SelectTrigger className="w-auto min-w-[140px] h-9 shadow-sm bg-background border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Ordenar" />
                </div>
            </SelectTrigger>
            <SelectContent align="start">
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function FilterSelect({
    config: filterConfig,
    value,
    onChange,
}: {
    config: SelectFilterConfig;
    value: string | null | undefined;
    onChange: (key: string, value: string | null) => void;
}) {
    const isActive = !!value && value !== "all";

    const activeLabel = useMemo(() => {
        if (!isActive) return null;
        return filterConfig.options.find((o) => o.value === value)?.label ?? null;
    }, [isActive, value, filterConfig.options]);

    const handleChange = useCallback(
        (val: string) => onChange(filterConfig.key, val === "all" ? null : val),
        [filterConfig.key, onChange],
    );

    return (
        <Select value={value ?? "all"} onValueChange={handleChange}>
            <SelectTrigger
                className={cn(
                    "w-auto h-9 min-w-[120px] transition-all duration-200 cursor-pointer",
                    isActive
                        ? "bg-primary/5 border-primary/50 text-primary hover:bg-primary/10"
                        : "border-dashed bg-transparent hover:bg-accent/50 hover:border-border text-muted-foreground hover:text-foreground",
                )}
            >
                <div className="flex items-center gap-2">
                    <Filter
                        className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isActive ? "text-primary fill-primary/20" : "text-muted-foreground",
                        )}
                    />
                    <span className={cn("text-sm", isActive && "font-medium")}>
                        <SelectValue>
                            {activeLabel ?? filterConfig.label}
                        </SelectValue>
                    </span>
                </div>
            </SelectTrigger>
            <SelectContent align="start">
                <SelectItem value="all" className="text-muted-foreground">
                    Todos
                </SelectItem>
                {filterConfig.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// ────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────

export default function SmartFilters({
    config,
    activeValues,
    onFilterChange,
    defaultSort = "createdAt-desc",
    className,
}: SmartFiltersProps) {
    const handleReset = useCallback(() => {
        config.filters?.forEach((f) => onFilterChange(f.key, null));
        onFilterChange("sort", defaultSort);
    }, [config.filters, defaultSort, onFilterChange]);

    const hasActiveFilters = useMemo(
        () =>
            Object.entries(activeValues).some(([key, val]) => {
                if (val === null || val === undefined || val === "" || val === "all") return false;
                if (key === "sort" && val === defaultSort) return false;
                return true;
            }),
        [activeValues, defaultSort],
    );

    const sortOptions = config.sort ?? [];
    const hasFilters = (config.filters?.length ?? 0) > 0;

    return (
        <div className={cn("flex flex-wrap items-center gap-2", className)}>
            {/* Sort */}
            {sortOptions.length > 0 && (
                <SortSelect
                    options={sortOptions}
                    value={activeValues.sort}
                    defaultSort={defaultSort}
                    onChange={(val) => onFilterChange("sort", val)}
                />
            )}

            {/* Separator */}
            {sortOptions.length > 0 && hasFilters && (
                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            )}

            {/* Dynamic filters */}
            {config.filters?.map((fc) => (
                <FilterSelect
                    key={fc.key}
                    config={fc}
                    value={activeValues[fc.key]}
                    onChange={onFilterChange}
                />
            ))}

            {/* Reset */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto sm:ml-0"
                >
                    <X className="h-4 w-4 text-red-500" />
                </Button>
            )}

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        </div>
    );
}