"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { User } from "@/shared/types/users.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Calendar } from "lucide-react";

export default function UserDetail({ user }: { user: User }) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage
                            src={user.image || ""}
                            alt={user.email}
                        />
                        <AvatarFallback>
                            {user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <CardTitle>
                            {user.email}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="flex gap-1 items-center">
                                <Shield className="w-3 h-3" />
                                {user.role}
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-xs">Fecha de creación</p>
                                <p className="font-medium">
                                    {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-xs">Última actualización</p>
                                <p className="font-medium">
                                    {format(new Date(user.updatedAt), "dd/MM/yyyy HH:mm")}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Placeholder for Activity Logs */}
            <Card className="text-muted-foreground flex flex-col items-center justify-center p-6 border-dashed md:col-span-2 h-40">
                <p>Registro de actividades (Logs de auditoría)</p>
                <p className="text-xs mt-2">Próximamente</p>
            </Card>
        </div>
    );
}
