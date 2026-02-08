"use client";

import { ThemeCustomizer } from "@/components/theme-customizer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { CommandMenu } from "./dashboard/command-menu";
import { UserButton } from "@clerk/nextjs";

interface HeaderProps {
  slug?: string;
  mode?: "organization" | "system";
}

export function Header({ slug, mode = "organization" }: HeaderProps) {
  // Trigger command menu programmatically if needed, or just let the Global listener handle it
  // But we want clicking the input to open it.

  // Actually, CommandMenu listens to Ctrl+K globally.
  // We just need a way to open it when clicking the "Input".
  // Since CommandMenu is a Dialog, we can manipulate its open state if we lift state up,
  // or just simulate the keypress, OR better:
  // We can render CommandMenu at the root (AdminLayout) and here just have a dummy button.
  // HOWEVER, simplified approach: Put CommandMenu here.

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
      {mode === "organization" && <CommandMenu />}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64 gap-0">
          <SheetHeader>
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          </SheetHeader>
          {/* Sidebar inside mobile sheet */}
          <Sidebar
            slug={slug}
            mode={mode}
            className="border-r-0 w-full h-full"
            forceExpanded={true}
          />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {mode === "organization" ? (
          <div className="relative">
            <Button
              variant="outline"
              className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
                );
              }}
            >
              <span className="hidden lg:inline-flex">Buscar...</span>
              <span className="inline-flex lg:hidden">Buscar...</span>
              <kbd className="pointer-events-none absolute right-[0.3rem] top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </Button>
          </div>
        ) : (
          <h1 className="font-semibold text-lg md:hidden">System Admin</h1>
        )}
      </div>

      <ThemeCustomizer />

      {mode === "organization" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <UserButton />
        </div>
      )}
    </header>
  );
}
