
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldBan, LogIn, CheckCircle } from "lucide-react";
import { useSystemOrganizations, useSuspendOrganization } from "@/hooks/system/use-system";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function SystemOrganizationsView() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const { data, isLoading } = useSystemOrganizations({ page, limit: 10, search, sort: 'createdAt-desc' });
    const { mutate: suspendOrg } = useSuspendOrganization();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page
    };

    if (isLoading) return <div>Cargando organizaciones...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Organizaciones</h2>
                <Input
                    placeholder="Buscar por nombre o slug..."
                    value={search}
                    onChange={handleSearch}
                    className="max-w-xs"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Creado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.records?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">No hay organizaciones encontradas</TableCell>
                            </TableRow>
                        ) : (
                            data?.records?.map((org) => (
                                <TableRow key={org.id}>
                                    <TableCell className="font-medium">{org.name}</TableCell>
                                    <TableCell>{org.slug}</TableCell>
                                    <TableCell>
                                        <Badge variant={org.isActive ? "default" : "destructive"}>
                                            {org.isActive ? "Activo" : "Suspendido"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(org.createdAt), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => alert("Impersonation coming soon")}>
                                                    <LogIn className="mr-2 h-4 w-4" /> Impersonate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => suspendOrg({ id: org.id, suspend: org.isActive })}>
                                                    {org.isActive ? (
                                                        <>
                                                            <ShieldBan className="mr-2 h-4 w-4" /> Suspender
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Reactivar
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={!data?.hasPrevious}
                >
                    Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                    Página {data?.currentPage} de {data?.totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((old) => (data?.hasNext ? old + 1 : old))}
                    disabled={!data?.hasNext}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
