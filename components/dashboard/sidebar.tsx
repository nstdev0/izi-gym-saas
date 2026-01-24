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

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useDashboard();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Miembros",
      icon: Users,
      href: "/admin/members",
      active: pathname.startsWith("/admin/members"),
    },
    {
      label: "Planes",
      icon: Dumbbell,
      href: "/admin/plans",
      active: pathname.startsWith("/admin/plans"),
    },
    {
      label: "Membresías",
      icon: CreditCard,
      href: "/admin/memberships",
      active: pathname.startsWith("/admin/memberships"),
    },
    {
      label: "Productos",
      icon: Package,
      href: "/admin/products",
      active: pathname.startsWith("/admin/products"),
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/admin/settings",
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-muted/40 border-r transition-all duration-300 ease-in-out",
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
            Gym Admin
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          <TooltipProvider delayDuration={0}>
            {routes.map((route) =>
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
                        <route.icon className="h-4 w-4" />
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
                    route.active && "bg-muted",
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ),
            )}
          </TooltipProvider>
        </nav>
      </div>
    </div>
  );
}
