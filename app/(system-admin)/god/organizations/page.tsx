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

export default async function GodModeOrganizationsPage() {
    await requireGodMode();

    // Consulta global de todas las organizaciones con su plan
    const organizations = await prisma.organization.findMany({
        include: {
            plan: true,
            _count: {
                select: { members: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organizaciones</h1>
                <p className="text-muted-foreground mt-2">
                    Listado global de todos los gimnasios registrados.
                </p>
            </div>

            <div className="rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead>Plan Actual</TableHead>
                            <TableHead>Stripe ID</TableHead>
                            <TableHead className="text-right">Miembros</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {organizations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hay organizaciones registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            organizations.map((org) => (
                                <TableRow key={org.id}>
                                    <TableCell className="font-medium">{org.name}</TableCell>
                                    <TableCell>{org.slug}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {org.createdAt.toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={org.plan?.name.includes("PRO") || org.plan?.name.includes("ENTERPRISE") ? "default" : "secondary"}>
                                            {org.plan?.name || org.organizationPlan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {org.stripeCustomerId ? (
                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                {org.stripeCustomerId}
                                            </code>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {org._count.members}
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
