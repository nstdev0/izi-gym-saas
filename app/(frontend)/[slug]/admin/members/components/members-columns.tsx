"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/server/domain/entities/Member";
import { Users, Mail, Phone, Trash2, Eye, PlusCircle } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useDeleteMember, useRestoreMember } from "@/hooks/members/use-members";
import { toast } from "sonner";
import { useState } from "react";

// Component for the Member Name cell to correctly use hooks
const MemberCell = ({ member }: { member: Member }) => {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        {member.image ? (
          <Image
            src={member.image}
            alt={`${member.firstName} ${member.lastName}`}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <Users className="w-4 h-4 text-primary" />
        )}
      </div>
      <div>
        <Link
          href={`/${slug}/admin/members/${member.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {member.firstName} {member.lastName}
        </Link>
      </div>
    </div>
  );
};

// Component for the Plan cell to correctly use hooks
const PlanCell = ({ member }: { member: Member }) => {
  const params = useParams();
  const slug = params.slug as string;
  const memberWithMembership = member as Member & {
    memberships?: Array<{ plan?: { name: string } }>;
  };
  const activePlan = memberWithMembership.memberships?.[0]?.plan?.name;

  if (activePlan) {
    return <div className="text-foreground font-medium">{activePlan}</div>;
  }

  return (
    <Link
      href={`/${slug}/admin/memberships/new?memberId=${member.id}`}
      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
    >
      <span>Sin plan</span>
      <PlusCircle className="w-4 h-4" />
    </Link>
  );
};

// Component for Actions to correctly use hooks and mutations
const MemberActions = ({ member }: { member: Member }) => {
  const params = useParams();
  const slug = params.slug as string;
  const { mutate: deleteMember, isPending } = useDeleteMember();
  const { mutate: restoreMember } = useRestoreMember();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteMember(member.id, {
      onSuccess: () => {
        setOpen(false);
        toast.success("Miembro eliminado", {
          description: "El miembro ha sido eliminado.",
          action: {
            label: "Deshacer",
            onClick: () => {
              restoreMember(member.id);
            },
          },
          duration: 5000,
        });
      },
    });
  };

  return (
    <div className="flex justify-center">
      <Link href={`/${slug}/admin/members/${member.id}`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="w-4 h-4" />
        </Button>
      </Link>
      {/* <Link href={`/${slug}/admin/members/${member.id}/edit`}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="w-4 h-4" />
        </Button>
      </Link> */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al
              miembro
              <span className="font-medium text-foreground">
                {" "}
                {member.firstName} {member.lastName}
              </span>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
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
    </div>
  );
};

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "member",
    header: "Miembro",
    cell: ({ row }) => <MemberCell member={row.original} />,
  },
  {
    accessorKey: "contact",
    header: "Contacto",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className={`w-3 h-3 ${member.email ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`${member.email ? "text-foreground" : "text-muted-foreground"}`}>
              {member.email ? member.email : "No registrado"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className={`w-3 h-3 ${member.phone ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`${member.phone ? "text-foreground" : "text-muted-foreground"}`}>
              {member.phone ? member.phone : "No registrado"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => <PlanCell member={row.original} />,
  },
  {
    accessorKey: "createdAt",
    header: "Desde",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString("es-ES")}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => <MemberActions member={row.original} />,
  },
];
