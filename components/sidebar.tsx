"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  Settings,
  CreditCard,
  Dumbbell,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
  Building2,
  ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, LogOut, User } from "lucide-react";

export function Sidebar({
  className,
  slug,
  forceExpanded = false,
  mode = "organization",
}: {
  className?: string;
  slug?: string;
  forceExpanded?: boolean;
  mode?: "organization" | "system";
}) {
  const pathname = usePathname();
  const { isSidebarCollapsed: contextCollapsed, toggleSidebar } =
    useDashboard();
  const { organization } = useOrganization();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  // If forceExpanded is true, we treat sidebar as NOT collapsed.
  const isSidebarCollapsed = forceExpanded ? false : contextCollapsed;

  interface RouteProps {
    label: string;
    icon: any;
    href: string;
    active: boolean;
    color?: string;
  }

  const safeSlug = slug || "";

  const orgRoutes: RouteProps[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/${safeSlug}/admin/dashboard`,
      active:
        pathname === `/${safeSlug}/admin/dashboard` ||
        pathname.startsWith(`/${safeSlug}/admin/dashboard/`),
    },
    {
      label: "Miembros",
      icon: Users,
      href: `/${safeSlug}/admin/members`,
      active:
        pathname === `/${safeSlug}/admin/members` ||
        pathname.startsWith(`/${safeSlug}/admin/members/`),
    },
    {
      label: "Membresías",
      icon: CreditCard,
      href: `/${safeSlug}/admin/memberships`,
      active:
        pathname === `/${safeSlug}/admin/memberships` ||
        pathname.startsWith(`/${safeSlug}/admin/memberships/`),
    },
    {
      label: "Planes",
      icon: Dumbbell,
      href: `/${safeSlug}/admin/plans`,
      active:
        pathname === `/${safeSlug}/admin/plans` ||
        pathname.startsWith(`/${safeSlug}/admin/plans/`),
    },
    {
      label: "Productos",
      icon: Package,
      href: `/${safeSlug}/admin/products`,
      active:
        pathname === `/${safeSlug}/admin/products` ||
        pathname.startsWith(`/${safeSlug}/admin/products/`),
    },
    {
      label: "Usuarios",
      icon: UserCog,
      href: `/${safeSlug}/admin/users`,
      active:
        pathname === `/${safeSlug}/admin/users` ||
        pathname.startsWith(`/${safeSlug}/admin/users/`),
    },
    {
      label: "Configuración",
      icon: Settings,
      href: `/${safeSlug}/admin/settings`,
      active:
        pathname === `/${safeSlug}/admin/settings` ||
        pathname.startsWith(`/${safeSlug}/admin/settings/`),
    },
    ...(user?.publicMetadata?.role === "GOD" ? [{
      label: "GOD Panel",
      icon: ShieldAlert,
      href: "/system/dashboard",
      active: pathname.startsWith("/system"),
      color: "text-sky-500",
    }] : []),
  ];

  const systemRoutes: RouteProps[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: "/system/dashboard",
      active: pathname === "/system/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Organizaciones",
      icon: Building2,
      href: "/system/organizations",
      active: pathname === "/system/organizations",
      color: "text-violet-500",
    },
    {
      label: "Usuarios Globales",
      icon: Users,
      href: "/system/users",
      active: pathname === "/system/users",
      color: "text-pink-700",
    },
    {
      label: "Configuración SaaS",
      icon: Settings,
      href: "/system/settings",
      active: pathname === "/system/settings",
    },
    // ...(user?.publicMetadata?.role === "GOD" ? [{
    //   label: "Dummy Gym Panel",
    //   icon: ShieldAlert,
    //   href: `${safeSlug}/admin/dashboard`,
    //   active: pathname.startsWith(`/${safeSlug}/admin/dashboard`),
    //   color: "text-sky-500",
    // }] : []),
  ];

  const routes = mode === "system" ? systemRoutes : orgRoutes;

  // Lógica de visualización del nombre
  const renderOrgName = () => {
    if (mode === "system") {
      return (
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          <span>Izi<span className="text-indigo-600">Gym</span> SaaS</span>
          {process.env.NODE_ENV === "development" && <span className="text-red-500"> &lt; (DEV) &gt; </span>}
        </div>
      );
    }
    // Fallback seguro si organization aún no carga o es null
    return (
      <span>
        {organization?.name || "Cargando..."}
        {process.env.NODE_ENV === "development" && <span className="text-red-500"> &lt; (DEV) &gt; </span>}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen bg-muted/40 border-r transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-[70px]" : "w-64",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b px-4 lg:h-[60px] transition-all duration-300",
          isSidebarCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {!isSidebarCollapsed && (
          <span className="font-semibold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300">
            {renderOrgName()}
          </span>
        )}
        {!forceExpanded && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          <TooltipProvider delayDuration={0}>
            {routes.map((route, index) =>
              isSidebarCollapsed ? (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={route.active ? "secondary" : "ghost"}
                      size="icon"
                      className={cn("h-9 w-9", route.active && "bg-muted")}
                      asChild
                    >
                      <Link href={route.href}>
                        <route.icon className={cn("h-4 w-4", route.color)} />
                        <span className="sr-only">{route.label}</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="flex items-center gap-4"
                  >
                    {route.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    `w-full justify-start gap-3 mb-1 animate-mobile-slide-in md:animate-none md:opacity-100`,
                    `${route.active ? "bg-muted pointer-events-none" : ""}`,
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className={cn("h-4 w-4", route.color)} />
                    {route.label}
                  </Link>
                </Button>
              ),
            )}
          </TooltipProvider>
        </nav>
      </div>
      <div
        className="mt-auto border-t p-4 animate-mobile-slide-in-footer md:animate-none md:opacity-100"
        style={{ animationDelay: "300ms" }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full p-2 h-auto hover:bg-muted justify-start",
                isSidebarCollapsed && "justify-center px-2",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3 w-full",
                  isSidebarCollapsed && "justify-center",
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.imageUrl}
                    alt={user?.fullName || ""}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
                  <>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium truncate w-[130px] text-left">
                        {process.env.NODE_ENV === "development" ? "development" : user?.fullName || "Usuario"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-[130px] text-left">
                        {process.env.NODE_ENV === "development" ? "test@development.dev" : user?.primaryEmailAddress?.emailAddress || ""}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isSidebarCollapsed ? "center" : "end"}
            className="w-56"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {process.env.NODE_ENV === "development" ? "development" : user?.fullName}
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
      </div>
    </div>
  );
}
