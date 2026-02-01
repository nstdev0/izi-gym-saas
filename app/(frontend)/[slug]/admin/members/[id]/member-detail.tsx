"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Member } from "@/server/domain/entities/Member";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function MemberDetail({ member }: { member: Member }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={member.image || ""}
              alt={`${member.firstName} ${member.lastName}`}
            />
            <AvatarFallback>
              {member.firstName[0]}
              {member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <CardTitle>
              {member.firstName} {member.lastName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {member.email && <span>{member.email}</span>}
              <Badge variant={member.isActive ? "default" : "destructive"}>
                {member.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Documento</p>
              <p className="font-medium">
                {member.docType} {member.docNumber}
              </p>
            </div>
            {member.phone && (
              <div>
                <p className="text-muted-foreground">Teléfono</p>
                <p className="font-medium">{member.phone}</p>
              </div>
            )}
            {member.gender && (
              <div>
                <p className="text-muted-foreground">Género</p>
                <p className="font-medium">{member.gender}</p>
              </div>
            )}
            {member.birthDate && (
              <div>
                <p className="text-muted-foreground">Fecha Nacimiento</p>
                <p className="font-medium">
                  {format(new Date(member.birthDate), "dd/MM/yyyy")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mediciones Físicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{member.height || "-"}</p>
            <p className="text-xs text-muted-foreground">Altura (cm)</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{member.weight || "-"}</p>
            <p className="text-xs text-muted-foreground">Peso (kg)</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{member.imc || "-"}</p>
            <p className="text-xs text-muted-foreground">IMC</p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Memberships/Payments history */}
      <Card className="text-muted-foreground flex items-center justify-center p-6 border-dashed">
        Historial de Membresías (Próximamente)
      </Card>
      <Card className="text-muted-foreground flex items-center justify-center p-6 border-dashed">
        Historial de Asistencias (Próximamente)
      </Card>
    </div>
  );
}
