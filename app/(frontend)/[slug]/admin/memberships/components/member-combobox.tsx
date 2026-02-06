"use client";

import * as React from "react";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/lib/api";

interface Member {
    id: string;
    firstName: string;
    lastName: string;
}

interface MemberComboboxProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    initialMember?: Member;
}

export function MemberCombobox({
    value,
    onChange,
    disabled = false,
    placeholder = "Selecciona un miembro",
    initialMember,
}: MemberComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [members, setMembers] = React.useState<Member[]>(
        initialMember ? [initialMember] : []
    );
    const [isLoading, setIsLoading] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    // Find selected member for display
    const selectedMember = members.find((m) => m.id === value);

    // Debounced search
    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (query.length < 2) {
            setMembers(initialMember ? [initialMember] : []);
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get<{ records: Member[] }>(
                `/api/members?search=${encodeURIComponent(query)}&limit=20&sort=createdAt-desc`
            );
            setMembers(response.records);
        } catch (error) {
            console.error("Error searching members:", error);
        } finally {
            setIsLoading(false);
        }
    }, 300);

    const handleSearch = (query: string) => {
        setSearchValue(query);
        debouncedSearch(query);
    };

    const handleSelect = (memberId: string) => {
        onChange(memberId === value ? "" : memberId);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                    disabled={disabled}
                >
                    {selectedMember
                        ? `${selectedMember.firstName} ${selectedMember.lastName}`
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar miembro..."
                        value={searchValue}
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        {isLoading ? (
                            <div className="py-6 text-center text-sm">
                                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                                <span className="mt-2 block text-muted-foreground">Buscando...</span>
                            </div>
                        ) : (
                            <>
                                <CommandEmpty>
                                    {searchValue.length < 2
                                        ? "Escribe al menos 2 caracteres"
                                        : "No se encontraron miembros"}
                                </CommandEmpty>
                                <CommandGroup>
                                    {members.map((member) => (
                                        <CommandItem
                                            key={member.id}
                                            value={member.id}
                                            onSelect={() => handleSelect(member.id)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === member.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {member.firstName} {member.lastName}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
