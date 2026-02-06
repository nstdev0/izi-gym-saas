import { getContainer } from "@/server/di/container";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import PlanDetail from "./plan-detail";

export const metadata: Metadata = {
    title: "Detalle de Plan",
};

export default async function PlanPage({
    params,
}: {
    params: Promise<{ slug: string; id: string }>;
}) {
    const { slug, id } = await params;
    const container = await getContainer();
    const plan = await container.getPlanByIdController.execute(undefined, id);

    if (!plan) {
        notFound();
    }

    const planPlain = JSON.parse(JSON.stringify(plan));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${slug}/admin/plans`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Detalle de Plan
                    </h1>
                </div>
                <Button asChild>
                    <Link href={`/${slug}/admin/plans/${id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Link>
                </Button>
            </div>

            <PlanDetail plan={planPlain} />
        </div>
    );
}
