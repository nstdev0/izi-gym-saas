"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, Building2, Crown, CreditCard, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDashboard } from "@/components/dashboard/dashboard-provider";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function GodSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { isSidebarCollapsed } = useDashboard();

    const routes = [
        {
            label: "Overview",
            icon: LayoutDashboard,
            href: `/god/dashboard`,
        },
        {
            label: "Organizations",
            icon: Building2,
            href: `/god/organizations`,
        },
        {
            label: "Users",
            icon: Users,
            href: `/god/users`,
        },
        {
            label: "Billing & MRR",
            icon: CreditCard,
            href: `/god/billing`,
        },
        {
            label: "Audit Logs",
            icon: ShieldAlert,
            href: `/god/audit-logs`,
        },
    ];

    return (
        <aside
            className={cn(
                "flex flex-col border-r bg-background transition-all duration-300",
                isSidebarCollapsed ? "w-14" : "w-64",
                className
            )}
        >
            <div className="flex h-14 items-center border-b px-3">
                <Link href="/god/dashboard" className="flex items-center gap-2 font-semibold hover:opacity-80 transition">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <span className={cn("text-base tracking-tight transition-all", isSidebarCollapsed && "hidden")}>
                        GOD Mode
                    </span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1.5 p-3 overflow-hidden">
                <TooltipProvider delayDuration={0}>
                    {routes.map((route) => {
                        const isActive = pathname === route.href;

                        return isSidebarCollapsed ? (
                            <Tooltip key={route.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={route.href}
                                        className={cn(
                                            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <route.icon className="h-4 w-4" />
                                        <span className="sr-only">{route.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">{route.label}</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />
                                )}
                                <route.icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                                <span className="truncate">{route.label}</span>
                            </Link>
                        );
                    })}
                </TooltipProvider>
            </nav>
        </aside>
    );
}
