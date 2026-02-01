"use client";

import * as React from "react";
import {
  CreditCard,
  Settings,
  Smile,
  Users,
  LayoutDashboard,
  Dumbbell,
  Package,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Escribe un comando o busca..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Sugerencias">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(`/${slug}/admin/members`))
            }
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Miembros</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push(`/${slug}/admin`))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(`/${slug}/admin/members/new`))
            }
          >
            <Smile className="mr-2 h-4 w-4" />
            <span>Nuevo Miembro</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navegación">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(`/${slug}/admin/plans`))
            }
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            <span>Planes</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(`/${slug}/admin/memberships`))
            }
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Membresías</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(`/${slug}/admin/products`))
            }
          >
            <Package className="mr-2 h-4 w-4" />
            <span>Productos</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push(`/${slug}/admin/settings`))
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
