"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/lib/api";

export interface MemberOption {
    id: string;
    firstName: string;
    lastName: string;
}

interface MemberComboboxProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    foundMember?: MemberOption | null;
    initialMember?: { id: string; firstName: string; lastName: string } | null;
}

export function MemberCombobox({
    value,
    onChange,
    disabled = false,
    placeholder = "Selecciona un miembro",
    foundMember,
    initialMember,
}: MemberComboboxProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Determinar el miembro con el que pre-poblar la lista
    const preloadMember = foundMember || (initialMember ? { id: initialMember.id, firstName: initialMember.firstName, lastName: initialMember.lastName } : null);

    // Lista de miembros
    const [members, setMembers] = useState<MemberOption[]>(
        preloadMember ? [preloadMember] : []
    );

    const [isLoading, setIsLoading] = useState(false);

    // 1. Sincronización con QR
    useEffect(() => {
        if (foundMember) {
            setMembers((prev) => {
                const exists = prev.some((m) => m.id === foundMember.id);
                if (exists) return prev;
                return [foundMember, ...prev];
            });
        }
    }, [foundMember]);

    // Cerrar dropdown al hacer click afuera
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Miembro seleccionado actualmente
    const selectedMember = members.find((m) => m.id === value);

    // 2. BÚSQUEDA ASÍNCRONA
    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (!query || query.length < 2) return;

        setIsLoading(true);
        try {
            const response = await api.get<{ records: MemberOption[] }>(
                `/api/members?search=${encodeURIComponent(query)}&limit=10`
            );

            setMembers((prev) => {
                const currentSelected = prev.find(m => m.id === value);
                // Si la nueva búsqueda no trae al seleccionado, lo mantenemos en la lista
                if (currentSelected && !response.records.find(r => r.id === value)) {
                    return [currentSelected, ...response.records];
                }
                return response.records;
            });
        } catch (error) {
            console.error("Error searching members:", error);
        } finally {
            setIsLoading(false);
        }
    }, 500);

    return (
        <div ref={containerRef} className="relative">
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                type="button"
            >
                {selectedMember ? (
                    <span className="truncate">
                        {selectedMember.firstName} {selectedMember.lastName}
                    </span>
                ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Buscar por nombre..."
                            onValueChange={(val) => debouncedSearch(val)}
                        />

                        <CommandList>
                            {isLoading && (
                                <div className="py-6 text-center text-sm flex items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Buscando...
                                </div>
                            )}

                            {!isLoading && members.length === 0 && (
                                <CommandEmpty>No se encontraron miembros.</CommandEmpty>
                            )}

                            <CommandGroup>
                                {members.map((member) => (
                                    <CommandItem
                                        key={member.id}
                                        value={member.id}
                                        onSelect={() => {
                                            onChange(member.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === member.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{member.firstName} {member.lastName}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
}