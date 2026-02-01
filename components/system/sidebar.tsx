"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  ShieldAlert,
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SystemSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const routes = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: "/system/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Organizaciones",
      icon: Building2,
      href: "/system/organizations",
      color: "text-violet-500",
    },
    {
      label: "Usuarios Globales",
      icon: Users,
      href: "/system/users",
      color: "text-pink-700",
    },
    {
      label: "Configuración SaaS",
      icon: Settings,
      href: "/system/settings",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-950 text-white w-64 border-r border-slate-800">
      <div className="px-3 py-2 flex-1">
        <Link href="/system/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <ShieldAlert className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-xl font-bold">
            Izi<span className="text-indigo-500">Gym</span>
            <span className="text-xs ml-1 text-slate-500 block font-normal">
              GOD MODE
            </span>
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-slate-800 mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition text-left outline-none group data-[state=open]:bg-white/5">
              <Avatar className="h-9 w-9 border border-slate-700">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                <AvatarFallback className="bg-indigo-600 text-white font-medium">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-slate-500 group-hover:text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-950 border-slate-800 text-slate-200"
            side="top"
          >
            <DropdownMenuLabel className="text-slate-400 font-normal text-xs">
              Mi Cuenta
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              className="focus:bg-slate-900 focus:text-white cursor-pointer"
              onClick={() => openUserProfile()}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
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
