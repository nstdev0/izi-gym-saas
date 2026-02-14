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
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, Menu, User, Search, Command } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { CommandMenu } from "./dashboard/command-menu";
import { cn } from "@/lib/utils";
import { useUserDetail } from "@/hooks/users/use-users";

interface HeaderProps {
  slug?: string;
  mode?: "organization" | "system";
}

export function Header({ slug, mode = "organization" }: HeaderProps) {
  const { user: clerkUser } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const { data: user } = useUserDetail(clerkUser?.id || "");

  // Helper para datos de usuario (Limpia el JSX)
  const isDev = process.env.NODE_ENV === "development";
  const displayName = isDev ? "Developer User" : clerkUser?.fullName || "Usuario";
  const displayEmail = isDev ? "dev@local.host" : clerkUser?.primaryEmailAddress?.emailAddress || "";
  const displayInitials = isDev ? "DV" : `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/40 bg-background/95 backdrop-blur-sm px-6 lg:h-[60px] transition-all overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="flex h-full w-full items-center gap-4 z-10">
        {/* Componente oculto para funcionalidad de comandos */}
        {mode === "organization" && <CommandMenu />}

        {/* Mobile Sidebar Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 md:hidden -ml-2 text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-72 gap-0 border-r-border/60">
            <SheetHeader>
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            </SheetHeader>
            <Sidebar
              slug={slug}
              mode={mode}
              className="border-r-0 w-full h-full bg-background"
              forceExpanded={true}
            />
          </SheetContent>
        </Sheet>

        {/* Search Bar / Title Area */}
        <div className="w-full flex-1">
          {mode === "organization" ? (
            <div className="relative w-full max-w-md">
              <Button
                variant="outline"
                className={cn(
                  "relative h-9 w-full justify-start rounded-lg border-muted-foreground/10 bg-muted/40 text-sm font-normal text-muted-foreground shadow-sm hover:bg-muted/60 hover:text-foreground transition-all sm:pr-12 md:w-64 lg:w-80"
                )}
                onClick={() => {
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
                  );
                }}
              >
                <Search className="mr-2 h-4 w-4 opacity-50" />
                <span className="hidden lg:inline-flex">Buscar en {slug}...</span>
                <span className="inline-flex lg:hidden">Buscar...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex shadow-sm">
                  <span className="text-xs">Ctrl</span>K
                </kbd>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-sky-500 rounded-full md:hidden"></div>
              <h1 className="font-semibold text-lg md:hidden tracking-tight">System Admin</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeCustomizer />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0 hover:bg-muted focus-visible:ring-1 focus-visible:ring-primary ml-1"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage
                    src={user?.image || clerkUser?.imageUrl}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openUserProfile()} className="cursor-pointer">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}