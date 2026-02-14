"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Search, User } from "lucide-react";
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
    const [inputValue, setInputValue] = useState(""); // Controlar el texto del input

    const preloadMember = foundMember || (initialMember ? { id: initialMember.id, firstName: initialMember.firstName, lastName: initialMember.lastName } : null);

    const [members, setMembers] = useState<MemberOption[]>(
        preloadMember ? [preloadMember] : []
    );

    const [isLoading, setIsLoading] = useState(false);

    // Sincronización con QR o Carga Inicial (Edición)
    useEffect(() => {
        const target = foundMember || initialMember;
        if (target) {
            setMembers((prev) => {
                const exists = prev.some((m) => m.id === target.id);
                if (exists) return prev;
                return [target, ...prev];
            });
        }
    }, [foundMember, initialMember]);

    // Cerrar dropdown al hacer click afuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const selectedMember = members.find((m) => m.id === value);

    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        // Permitimos buscar si hay al menos 2 caracteres
        if (!query || query.length < 2) return;

        setIsLoading(true);
        try {
            const response = await api.get<{ records: MemberOption[] }>(
                `/api/members?search=${encodeURIComponent(query)}&limit=10`
            );

            setMembers((prev) => {
                // Mantenemos siempre al seleccionado actual en la lista para que no desaparezca el Check
                const currentSelected = prev.find(m => m.id === value);
                const newRecords = response.records.filter(r => r.id !== value);
                return currentSelected ? [currentSelected, ...newRecords] : response.records;
            });
        } catch (error) {
            console.error("Error searching members:", error);
        } finally {
            setIsLoading(false);
        }
    }, 500);

    return (
        <div ref={containerRef} className="relative w-full">
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                    "w-full justify-between h-11 px-4 bg-background/50 border-input/60 hover:border-primary/50 transition-all shadow-sm",
                    !selectedMember && "text-muted-foreground"
                )}
                disabled={disabled}
                onClick={() => setOpen(!open)}
                type="button"
            >
                <div className="flex items-center gap-2 truncate">
                    <User className={cn("h-4 w-4 opacity-50", selectedMember && "text-primary opacity-100")} />
                    {selectedMember ? (
                        <span className="truncate font-medium text-foreground">
                            {selectedMember.firstName} {selectedMember.lastName}
                        </span>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <Command shouldFilter={false} className="bg-transparent">
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <CommandInput
                                placeholder="Escribe nombre o DNI..."
                                value={inputValue}
                                onValueChange={(val) => {
                                    setInputValue(val); // Actualiza el texto visualmente
                                    debouncedSearch(val); // Dispara la búsqueda API
                                }}
                                className="h-11 bg-transparent focus:ring-0 border-none"
                            />
                        </div>

                        <CommandList className="max-h-[250px] overflow-y-auto p-1">
                            {isLoading && (
                                <div className="py-6 text-center text-sm flex items-center justify-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    Buscando miembros...
                                </div>
                            )}

                            {!isLoading && members.length === 0 && inputValue.length >= 2 && (
                                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                    No se encontraron resultados.
                                </CommandEmpty>
                            )}

                            {!isLoading && inputValue.length < 2 && members.length === 0 && (
                                <div className="py-6 text-center text-xs text-muted-foreground italic">
                                    Escribe al menos 2 letras...
                                </div>
                            )}

                            <CommandGroup>
                                {members.map((member) => (
                                    <CommandItem
                                        key={member.id}
                                        value={member.id}
                                        onSelect={() => {
                                            onChange(member.id);
                                            setOpen(false);
                                            setInputValue(""); // Limpiar búsqueda al seleccionar
                                        }}
                                        className="flex items-center justify-between py-3 px-4 cursor-pointer rounded-lg hover:bg-primary/5"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                value === member.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                {member.firstName[0]}{member.lastName[0]}
                                            </div>
                                            <span className={cn(value === member.id && "font-bold")}>
                                                {member.firstName} {member.lastName}
                                            </span>
                                        </div>
                                        {value === member.id && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
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