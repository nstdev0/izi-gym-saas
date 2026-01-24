"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/server/domain/entities/Member";
import { Users, Mail, Phone, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "member",
    header: "Miembro",
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {member.firstName} {member.lastName}
            </p>
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
            <Mail className="w-3 h-3" />
            {member.email}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3 h-3" />
            {member.phone}
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
    cell: () => {
      return (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      );
    },
  },
];
