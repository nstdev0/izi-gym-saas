"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { MembersTable } from "./members-table";
import Loading from "../loading";
import { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams, useSearchParams } from "next/navigation";
import SmartFilters from "@/components/ui/smart-filters";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { useMembersList } from "@/hooks/members/use-members";
import { Member } from "@/server/domain/entities/Member";

export default function MembersViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const membership = searchParams.get("membership") || undefined;

  const { data: paginatedMembers, isLoading } = useMembersList({
    page,
    limit,
    search,
    sort,
    membershipStatus: membership,
  });

  const filtersConfig: FilterConfiguration<Member> = {
    sort: [
      {
        label: "Nombres (A-Z)",
        field: "firstName",
        value: "firstName-asc"
      },
      {
        label: "Nombres (Z-A)",
        field: "firstName",
        value: "firstName-desc"
      }
    ],

    filters: [
      {
        key: "membership",
        label: "Membresía",
        options: [
          { label: "Activo", value: "active" },
          { label: "Inactivo", value: "inactive" }
        ]
      }
    ]
  };

  // If loading or no data, handle appropriately. 
  // Since we prefetch, data should be available immediately unless parameters changed.
  // keepPreviousData is used in hook, so pagination should be smooth.

  const members = paginatedMembers?.records || [];
  const totalPages = paginatedMembers?.totalPages || 0;
  const totalRecords = paginatedMembers?.totalRecords || 0;
  const currentRecordsCount = members.length;

  return (
    <Suspense fallback={<Loading />}>
      <DashboardLayout
        breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Miembros" }]}
      >
        <PageHeader
          title="Gestión de Miembros"
          description="Administra todos los miembros de tu gimnasio"
          actions={
            <Link href={`/${slug}/admin/members/new`}>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Miembro
              </Button>
            </Link>
          }
        />
        <div className="flex flex-col h-full space-y-4 overflow-hidden">


          {/* ⚠️ ADVERTENCIA DE LÓGICA: 
                         Estas estadísticas solo reflejan la página actual (ej. 10 usuarios), 
                         NO el total de la base de datos. 
                         Para hacerlo bien, el backend debería devolver un objeto 'stats' junto con la paginación.
                     */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Miembros", value: totalRecords.toString() },
              { label: "En esta página", value: currentRecordsCount.toString() },
            ].map((stat, index) => (
              <Card key={index} className="p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-foreground">
                  {isLoading ? "..." : stat.value}
                </p>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* SearchInput necesita Suspense boundary, pero como toda la pagina 
                             esta envuelta, funcionará bien. */}
            <SearchInput placeholder="Buscar por nombres, email..." />
            <SmartFilters config={filtersConfig} />
          </div>

          <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
            {isLoading ? (
              <div className="p-4 flex justify-center items-center h-full">Cargando...</div>
            ) : (
              <>
                <MembersTable members={members} />
                <div className="p-2 border-t bg-background">
                  <Pagination currentPage={page} totalPages={totalPages} />
                </div>
              </>
            )}

          </Card>
        </div>
      </DashboardLayout>
    </Suspense>
  );
}
