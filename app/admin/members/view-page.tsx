"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { Member } from "@/server/domain/entities/Member";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { MembersTable } from "./components/members-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Loading from "./loading";
import Link from "next/link";
import { PageableResponse } from "@/server/shared/common/pagination";

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split(":");
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    params.set("order", order);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const currentSort = `${searchParams.get("sort") || "createdAt"}:${searchParams.get("order") || "desc"}`;

  return (
    <Suspense fallback={<Loading />}>
      <DashboardLayout
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Miembros" }]}
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
            <Link href="/admin/members/new">
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
            <SearchInput placeholder="Buscar por nombre, email..." />
            <div className="flex items-center gap-2">
              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] h-9">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Ordenar por" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Más recientes</SelectItem>
                  <SelectItem value="createdAt:asc">Más antiguos</SelectItem>
                  <SelectItem value="firstName:asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="firstName:desc">Nombre (Z-A)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent h-9"
              >
                Filtrar
              </Button>
            </div>
          </div>

          {/* Members Table Container - Fill remaining space */}
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
