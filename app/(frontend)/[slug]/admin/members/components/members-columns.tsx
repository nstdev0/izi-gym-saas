"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/server/domain/entities/Member";
import { Users, Mail, Phone, Edit, Trash2, Eye } from "lucide-react";
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
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import Image from "next/image";

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "member",
    header: "Miembro",
    cell: ({ row }) => {
      const member = row.original;
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
              className="font-medium text-foreground"
            >
              {member.firstName} {member.lastName}
            </Link>
          </div>
        </div>
      );
    },
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
    header: () => <div className="text-center">Acciones</div>,
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const params = useParams();
      const slug = params.slug as string;
      const member = row.original;

      return (
        <div className="flex justify-center">
          <Link href={`/${slug}/admin/members/${member.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/${slug}/admin/members/${member.id}/edit`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <AlertDialog>
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
                  Esta acción no se puede deshacer. Esto eliminará
                  permanentemente al miembro
                  <span className="font-medium text-foreground">
                    {" "}
                    {member.firstName} {member.lastName}
                  </span>{" "}
                  y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                  onClick={async () => {
                    try {
                      await api.delete<Member>(`/api/members/${member.id}`);
                      toast.success("Miembro eliminado correctamente");
                      window.location.reload(); // Simple refresh for now.
                    } catch (error) {
                      if (error instanceof ApiError) {
                        toast.error(error.message);
                      } else {
                        toast.error("Error al eliminar miembro");
                      }
                      console.error(error);
                    }
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
