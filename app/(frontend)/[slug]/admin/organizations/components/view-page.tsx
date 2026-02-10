"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { Organization } from "@/server/domain/entities/Organization";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
// You'll need to create this table component or use a generic one
// import { OrganizationsTable } from "./organizations-table"; 
import Loading from "../loading";
import { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams, useSearchParams } from "next/navigation";
import SmartFilters from "@/components/ui/smart-filters";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useOrganizationsList } from "@/hooks/organizations/use-organizations";
import { OrganizationsTable } from "./organizations-table";
import { useQueryStates } from "nuqs";
import { organizationParsers } from "@/lib/nuqs/search-params/organizationParsers";

export default function OrganizationsViewPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [queryStates, setQueryStates] = useQueryStates(organizationParsers, {
        shallow: true,
        history: "push"
    });

    const { page, limit, ...restFilters } = queryStates;

    const { data: paginatedOrganizations, isLoading } = useOrganizationsList({
        page,
        limit,
        ...restFilters,
    });

    const organizations = paginatedOrganizations?.records || [];
    const totalPages = paginatedOrganizations?.totalPages || 0;
    const totalRecords = paginatedOrganizations?.totalRecords || 0;

    const filtersConfig: FilterConfiguration<Organization> = {
        sort: [
            { label: "Nombre (A-Z)", field: "name", value: "name-asc" },
            { label: "Nombre (Z-A)", field: "name", value: "name-desc" },
            { label: "Slug (A-Z)", field: "slug", value: "slug-asc" },
            { label: "Slug (Z-A)", field: "slug", value: "slug-desc" },
        ],

        filters: [
            {
                key: "status",
                label: "Estado",
                options: [
                    { label: "Activo", value: "active" },
                    { label: "Inactivo", value: "inactive" }
                ]
            }
        ]
    };

    const handleFilterChange = (key: string, value: string | null) => {
        setQueryStates({
            [key]: value,
            page: 1,
        });
    };

    return (
        <Suspense fallback={<Loading />}>
            <DashboardLayout
                breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Organizaciones" }]}
            >
                <PageHeader
                    title="Gestión de Organizaciones"
                    description="Administra los tenants del sistema"
                    actions={
                        <Link href={`/${slug}/admin/organizations/new`}>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Nueva Organización
                            </Button>
                        </Link>
                    }
                />
                <div className="flex flex-col h-full space-y-4 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total Organizaciones", value: totalRecords.toString() },
                            { label: "En esta página", value: organizations.length.toString() },
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
                            placeholder="Buscar por nombre, slug..."
                            value={queryStates.search || ""}
                            onChange={(value) => {
                                setQueryStates({
                                    search: value,
                                    page: 1,
                                });
                            }}
                        />
                        <SmartFilters
                            config={filtersConfig}
                            activeValues={{ sort: queryStates.sort, status: queryStates.status }}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
                        {isLoading ? (
                            <div className="p-4 flex justify-center items-center h-full">Cargando...</div>
                        ) : (
                            <>
                                <OrganizationsTable organizations={organizations} />
                                <div className="p-2 border-t bg-background">
                                    <Pagination
                                        currentPage={queryStates.page}
                                        totalPages={totalPages}
                                        onPageChange={(page) => setQueryStates({ page })}
                                        onLimitChange={(limit) => setQueryStates({ limit, page: 1 })}
                                        currentLimit={queryStates.limit}
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
