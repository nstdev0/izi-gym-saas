import PlanForm from "../components/plans-form";
import { getContainer } from "@/server/di/container";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";

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
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {plan.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">Gestiona la información del plan</p>
                    </div>
                </div>
            </div>

            <PlanForm initialData={planPlain} redirectUrl={`/${slug}/admin/plans`} />
        </div>
    );
}
