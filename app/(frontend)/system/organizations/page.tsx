import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ExternalLink, MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/server/infrastructure/persistence/prisma"; // Acceso directo para SuperAdmin

// Hacemos el componente async para traer datos
export default async function OrganizationsPage() {
  // 1. OBTENER DATOS REALES
  // Como Super Admin, podemos usar Prisma directo o tu getSystemContainer().
  // Para simplificar la vista, prisma directo está bien en este nivel.
  const tenants = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      _count: {
        select: { users: true }, // Contamos usuarios reales
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Organizaciones
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona los gimnasios registrados en la plataforma.
          </p>
        </div>
        <Link href="/system/organizations/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Nueva Organización
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o slug..."
            className="pl-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800">
              <TableHead className="text-slate-500 dark:text-slate-400">Nombre</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Slug (URL)</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Usuarios</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Plan</TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400">Estado</TableHead>
              <TableHead className="text-right text-slate-500 dark:text-slate-400">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow
                key={tenant.id}
                className="hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  {tenant.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {tenant.slug}
                </TableCell>
                <TableCell className="text-slate-500 dark:text-slate-300">
                  {tenant._count.users}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  >
                    Pro
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      tenant.isActive
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/25"
                        : "bg-red-500/15 text-red-600 dark:text-red-500 hover:bg-red-500/25"
                    }
                  >
                    {tenant.isActive ? "ACTIVO" : "INACTIVO"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Botón mágico para entrar a su dashboard */}
                    <Link
                      href={`/${tenant.slug}/admin/dashboard`}
                      target="_blank"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
