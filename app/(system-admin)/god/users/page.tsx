import { prisma } from "@/server/infrastructure/persistence/prisma";
import { requireGodMode } from "@/server/infrastructure/auth/god-mode";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function GodModeUsersPage() {
    await requireGodMode();

    // Consulta global de todos los usuarios
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { memberships: true },
            },
            memberships: {
                where: { role: "GOD" },
                select: { id: true },
            }
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Usuarios Globales</h1>
                <p className="text-muted-foreground mt-2">
                    Listado de todos los usuarios registrados en Clerk y sincronizados en la base de datos.
                </p>
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Organizaciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No hay usuarios registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.firstName || user.lastName
                                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                            : '—'}
                                        {user.memberships.length > 0 && (
                                            <Badge variant="destructive" className="ml-2 text-[10px] h-5">GOD</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {user.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {user.isActive ? (
                                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Activo</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {user._count.memberships}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
