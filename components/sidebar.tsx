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
  HelpCircle,
  CalendarCheck,
  ChevronsUpDown,
  LogOut,
  User,
  Crown,
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
import { useOrganizationDetail } from "@/hooks/organizations/use-organizations";
import { useUserDetail } from "@/hooks/users/use-users";

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
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { organization: clerkOrganization } = useOrganization();
  const { data: user } = useUserDetail(clerkUser?.id || "");

  // Safe access to ID
  const orgId = clerkOrganization?.id;
  const { data: organizationDetail } = useOrganizationDetail(orgId || "");
  const organizationPlan = organizationDetail?.organizationPlan || "";

  // If forceExpanded is true, we treat sidebar as NOT collapsed.
  const isSidebarCollapsed = forceExpanded ? false : contextCollapsed;

  interface RouteProps {
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    href: string;
    active: boolean;
    color?: string;
  }

  const safeSlug = slug || "";

  const orgRoutes: RouteProps[] = [
    {
      label: "Panel",
      icon: LayoutDashboard,
      href: `/${safeSlug}/admin/dashboard`,
      active:
        pathname === `/${safeSlug}/admin/dashboard` ||
        pathname.startsWith(`/${safeSlug}/admin/dashboard/`),
    },
    {
      label: "Asistencias",
      icon: CalendarCheck,
      href: `/${safeSlug}/admin/attendances`,
      active:
        pathname === `/${safeSlug}/admin/attendances` ||
        pathname.startsWith(`/${safeSlug}/admin/attendances/`),
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
    ...(clerkUser?.publicMetadata?.role === "GOD"
      ? [
        {
          label: "GOD Panel",
          icon: ShieldAlert,
          href: "/system/dashboard",
          active: pathname.startsWith("/system"),
          color: "text-sky-500",
        },
      ]
      : []),
    {
      label: "Ayuda",
      icon: HelpCircle,
      href: "/help",
      active: pathname.startsWith("/help"),
      color: "text-red-400",
    },
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
  ];

  const routes = mode === "system" ? systemRoutes : orgRoutes;

  const renderOrgName = () => {
    if (mode === "system") {
      return (
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          <span>
            Izi<span className="text-indigo-600">Gym</span> SaaS
          </span>
          {process.env.NODE_ENV === "development" && (
            <span className="text-red-500 ml-1 text-xs font-mono">&lt;DEV&gt;</span>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 truncate">
        {/* Aquí podrías agregar el logo de la organización si existe */}
        <span className="truncate">
          {clerkOrganization?.name || "Cargando..."}
        </span>
        {process.env.NODE_ENV === "development" && (
          <span className="text-red-500 ml-1 text-xs font-mono">&lt;DEV&gt;</span>
        )}
      </div>
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
          // CORRECCIÓN IMPORTANTE: Cambiado de <span> a <div> para evitar errores de hidratación
          // ya que renderOrgName puede devolver un div.
          <div className="font-semibold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300">
            {renderOrgName()}
          </div>
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

      <div className="flex-1 overflow-x-hidden overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          <TooltipProvider delayDuration={0}>
            {routes.map((route, index) =>
              isSidebarCollapsed ? (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={route.active ? "secondary" : "ghost"}
                      size="icon"
                      className={cn("h-9 w-9", route.active && "bg-primary/10 text-primary hover:bg-primary/20")}
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
                    "w-full justify-start gap-3 mb-1",
                    // Solo animamos en montaje inicial o móvil, no en cada render
                    "animate-in fade-in slide-in-from-left-2 duration-300",
                    route.active && "bg-primary/10 text-primary pointer-events-none font-medium"
                  )}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className={cn("h-4 w-4", route.active ? "text-primary" : route.color)} />
                    {route.label}
                  </Link>
                </Button>
              ),
            )}

            {/* SECCIÓN DEL PLAN */}
            {mode === "organization" && organizationPlan && (
              <div className="mt-4 pt-4 border-t border-border/50">
                {isSidebarCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto cursor-help">
                        <Crown className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-medium">Plan Actual:</p>
                      <p className="capitalize text-xs text-muted-foreground">
                        {organizationPlan.replace(/-/g, " ")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div
                    className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 shadow-sm animate-in fade-in zoom-in duration-300"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Crown className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Plan Actual
                      </span>
                      <span className="truncate text-sm font-semibold capitalize text-foreground">
                        {organizationPlan.replace(/-/g, " ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TooltipProvider>
        </nav>
      </div>

      <div className="border-t p-1 bg-background/50 backdrop-blur-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full p-2 h-auto hover:bg-muted justify-start",
                isSidebarCollapsed && "justify-center px-0",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-3 w-full",
                  isSidebarCollapsed && "justify-center",
                )}
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage
                    src={user?.image || clerkUser?.imageUrl}
                    alt={user?.firstName + " " + user?.lastName || clerkUser?.fullName || ""}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.firstName?.charAt(0) || clerkUser?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0) || clerkUser?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
                  <>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium truncate w-[120px] text-left">
                        {process.env.NODE_ENV === "development" && !user?.firstName
                          ? "Dev User"
                          : user?.firstName + " " + user?.lastName || clerkUser?.fullName || "Usuario"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-[120px] text-left">
                        {process.env.NODE_ENV === "development" && !user?.email
                          ? "dev@local.host"
                          : user?.email || clerkUser?.primaryEmailAddress?.emailAddress || ""}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isSidebarCollapsed ? "center" : "start"}
            className="w-56"
            side={isSidebarCollapsed ? "right" : "top"}
            sideOffset={10}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {clerkUser?.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${safeSlug}/admin/profile`} className="w-full cursor-pointer flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
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