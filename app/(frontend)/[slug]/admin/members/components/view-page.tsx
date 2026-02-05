"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Member } from "@/server/domain/entities/Member";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { MembersTable } from "./members-table";
import Loading from "../loading";
import Link from "next/link";
import { PageableResponse } from "@/server/shared/common/pagination";
import FiltersInput, { UiSortOption } from "@/components/ui/filters-input";
import { useParams } from "next/navigation";

interface MembersViewPageProps {
  paginatedMembers: PageableResponse<Member>;
}

export default function MembersViewPage({
  paginatedMembers,
}: MembersViewPageProps) {
  const {
    records: members,
    currentPage,
    totalPages,
    totalRecords,
  } = paginatedMembers;

  const params = useParams();
  const slug = params.slug as string;

  const membersSortOptions: UiSortOption<Member>[] = [
    {
      label: "Nombres (A-Z)",
      field: "firstName",
      direction: "asc",
      value: "firstName-asc",
    },
    {
      label: "Nombres (Z-A)",
      field: "firstName",
      direction: "desc",
      value: "firstName-desc",
    },
    {
      label: "Apellido (A-Z)",
      field: "lastName",
      direction: "asc",
      value: "lastName-asc",
    },
    {
      label: "Apellido (Z-A)",
      field: "lastName",
      direction: "desc",
      value: "lastName-desc",
    }
  ]

  return (
    <Suspense fallback={<Loading />}>
      <DashboardLayout
        breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Miembros" }]}
      >
        <div className="flex flex-col h-full space-y-4 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Gestión de Miembros
              </h1>
              <p className="text-sm text-muted-foreground">
                Administra todos los miembros de tu gimnasio
              </p>
            </div>
            <Link href={`/${slug}/admin/members/new`}>
              <Button
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Nuevo Miembro
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Miembros", value: totalRecords.toString() },
              { label: "Activos Este Mes", value: "892" },
              { label: "Vencimientos Próximos", value: "24" },
            ].map((stat, index) => (
              <Card key={index} className="p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-foreground">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Filters */}

          <div className="flex flex-col sm:flex-row gap-2">
            <SearchInput placeholder="Buscar por nombres, email, telefono..." />
            <FiltersInput sortOptions={membersSortOptions} />
          </div>

          {/* Members Table Container */}
          <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
            <MembersTable members={members} />
            <div className="p-2 border-t bg-background">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </Card>
        </div>
      </DashboardLayout>
    </Suspense>
  );
}
