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
import { LogOut, Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { CommandMenu } from "./dashboard/command-menu";

interface HeaderProps {
  slug?: string;
  mode?: "organization" | "system";
}

export function Header({ slug, mode = "organization" }: HeaderProps) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-0 hover:bg-muted rounded-full"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.imageUrl}
                  alt={process.env.NODE_ENV === "development" ? "test" : user?.fullName || ""}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {process.env.NODE_ENV === "development" ? "test" : user?.firstName?.charAt(0)}
                  {process.env.NODE_ENV === "development" ? "test" : user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* <div className="hidden flex-col items-end md:flex min-w-0 text-right">
                <span className="text-sm font-medium truncate w-[130px]">
                  {user?.fullName || "Usuario"}
                </span>
                <span className="text-xs text-muted-foreground truncate w-[130px]">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </span>
              </div> */}
              {/* <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground hidden md:block" /> */}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {process.env.NODE_ENV === "development" ? "test" : user?.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {process.env.NODE_ENV === "development" ? "test@development.dev" : user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openUserProfile()}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-100"
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
