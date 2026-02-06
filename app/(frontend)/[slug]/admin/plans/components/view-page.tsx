"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { Plan } from "@/server/domain/entities/Plan";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import Loading from "../loading";
import { PageableResponse } from "@/server/shared/common/pagination";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { PlansTable } from "./plans-table";

interface PlansViewPageProps {
    paginatedPlans: PageableResponse<Plan>;
}

export default function PlansViewPage({ paginatedPlans }: PlansViewPageProps) {
    const {
        records: plans,
        currentPage,
        totalPages,
        totalRecords,
    } = paginatedPlans;

    const params = useParams();
    const slug = params.slug as string;

    return (
        <Suspense fallback={<Loading />}>
            <DashboardLayout
                breadcrumbs={[
                    { label: "Admin", href: `/${slug}/admin/dashboard` },
                    { label: "Planes" },
                ]}
            >
                <PageHeader
                    title="Gestión de Planes"
                    description="Administra los planes de membresía de tu gimnasio"
                    actions={
                        <Link href={`/${slug}/admin/plans/new`}>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Nuevo Plan
                            </Button>
                        </Link>
                    }
                />
                <div className="flex flex-col h-full space-y-4 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total Planes", value: totalRecords.toString() },
                            { label: "Planes Activos", value: plans.filter(p => p.isActive).length.toString() },
                            { label: "En esta página", value: plans.length.toString() },
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

                    <div className="flex flex-col sm:flex-row gap-2">
                        <SearchInput placeholder="Buscar por nombre..." />
                    </div>

                    <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <PlansTable plans={plans} />
                        <div className="p-2 border-t bg-background">
                            <Pagination currentPage={currentPage} totalPages={totalPages} />
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        </Suspense>
    );
}
