"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { MembersTable } from "./members-table";
import Loading from "../loading";
import { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams } from "next/navigation";
import SmartFilters from "@/components/ui/smart-filters";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { useMembersList } from "@/hooks/members/use-members";
import { Member } from "@/server/domain/entities/Member";
import { membersParsers } from "@/lib/nuqs/search-params/members";
import { useQueryStates } from "nuqs";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  VisibilityState,
} from "@tanstack/react-table";
import { columns } from "./members-columns";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function MembersViewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [filters, setFilters] = useQueryStates(membersParsers, {
    shallow: false
  });

  const { data: paginatedMembers, isLoading } = useMembersList(filters);

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
        key: "status",
        label: "Membresía",
        options: [
          { label: "Activo", value: "active" },
          { label: "Inactivo", value: "inactive" }
        ]
      }
    ]
  };

  const members = paginatedMembers?.records || [];
  const totalPages = paginatedMembers?.totalPages || 0;
  const totalRecords = paginatedMembers?.totalRecords || 0;
  const currentRecordsCount = members.length;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters({
      [key]: value,
      page: 1,
    });
  };

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
            <SearchInput
              placeholder="Buscar por nombres, email..."
              value={filters.search || ""}
              onChange={(value) => setFilters({ search: value, page: 1 })}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columnas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.columnDef.header as string || column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <SmartFilters
              config={filtersConfig}
              activeValues={{ sort: filters.sort, status: filters.status }}
              onFilterChange={handleFilterChange}
            />
          </div>
          <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
            {isLoading ? (
              <div className="p-4 flex justify-center items-center h-full">Cargando...</div>
            ) : (
              <>
                <MembersTable table={table} />
                <div className="p-2 border-t bg-background">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={totalPages}
                    onPageChange={(page) => setFilters({ page })}
                    onLimitChange={(limit) => setFilters({ limit, page: 1 })}
                    currentLimit={filters.limit}
                  />
                </div>
              </>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </Suspense>
  );
}
