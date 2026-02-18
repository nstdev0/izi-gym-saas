"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MemberResponse } from "@/shared/types/members.types";
import { Mail, Phone, Trash2, Eye, PlusCircle, MoreHorizontal, User, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDeleteMember, useRestoreMember } from "@/hooks/members/use-members";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- HELPERS ---
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// --- CELDAS PERSONALIZADAS ---

const MemberCell = ({ member }: { member: MemberResponse }) => {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="flex items-center gap-3 group">
      <Avatar className="h-9 w-9 border border-border/50 bg-background transition-transform group-hover:scale-105">
        <AvatarImage src={member.image || undefined} alt={member.firstName} />
        <AvatarFallback className="text-xs font-bold bg-linear-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400">
          {member.firstName[0]}{member.lastName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <Link
          href={`/${slug}/admin/members/${member.id}`}
          className="font-medium text-sm text-foreground hover:text-primary transition-colors"
        >
          {member.firstName} {member.lastName}
        </Link>
        <span className="text-[10px] text-muted-foreground font-mono">
          ID: {member.docNumber || "N/A"}
        </span>
      </div>
    </div>
  );
};

const PlanCell = ({ member }: { member: MemberResponse }) => {
  const params = useParams();
  const slug = params.slug as string;

  const memberWithMembership = member as MemberResponse & {
    memberships?: Array<{ plan?: { name: string }; status: string }>;
  };

  const activeMembership = memberWithMembership.memberships?.find((m: { status: string }) => m.status === 'ACTIVE' || m.status === 'PENDING');
  const planName = activeMembership?.plan?.name;

  if (planName) {
    return (
      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 shadow-xs font-normal">
        <ShieldCheck className="w-3 h-3 mr-1.5" />
        {planName}
      </Badge>
    );
  }

  return (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50" asChild>
      <Link href={`/${slug}/admin/memberships/new?memberId=${member.id}`}>
        <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
        Asignar Plan
      </Link>
    </Button>
  );
};

const ContactCell = ({ member }: { member: MemberResponse }) => {
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Mail className={cn("w-3 h-3", member.email ? "text-foreground" : "opacity-50")} />
        <span className={cn("truncate max-w-[140px]", member.email ? "text-foreground" : "italic opacity-50")}>
          {member.email || "Sin email"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Phone className={cn("w-3 h-3", member.phone ? "text-foreground" : "opacity-50")} />
        <span className={cn("font-mono", member.phone ? "text-foreground" : "italic opacity-50")}>
          {member.phone || "Sin teléfono"}
        </span>
      </div>
    </div>
  );
};

const MemberActions = ({ member }: { member: MemberResponse }) => {
  const params = useParams();
  const slug = params.slug?.toString();
  const { mutate: deleteMember, isPending } = useDeleteMember();
  const { mutate: restoreMember } = useRestoreMember();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    deleteMember(member.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        toast.success("Miembro eliminado", {
          action: {
            label: "Deshacer",
            onClick: () => restoreMember(member.id),
          },
        });
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50" asChild>
          <Link href={`/${slug}/admin/members/${member.id}`}>
            <Eye className="w-4 h-4" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${slug}/admin/members/${member.id}`} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" /> Ver Perfil Completo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/${slug}/admin/memberships/new?memberId=${member.id}`} className="cursor-pointer">
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Membresía
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Miembro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Eliminar miembro
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará al miembro como eliminado. Podrás restaurarlo brevemente, pero sus accesos serán revocados inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const columns: ColumnDef<MemberResponse>[] = [
  {
    accessorKey: "member",
    header: "Miembro",
    cell: ({ row }) => <MemberCell member={row.original} />,
  },
  {
    accessorKey: "contact",
    header: "Contacto",
    cell: ({ row }) => <ContactCell member={row.original} />,
  },
  {
    accessorKey: "plan",
    header: "Plan Actual",
    cell: ({ row }) => <PlanCell member={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: "Registrado",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="w-3.5 h-3.5 opacity-70" />
        <span className="font-mono">{formatDate(row.getValue("createdAt"))}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => <MemberActions member={row.original} />,
  },
];