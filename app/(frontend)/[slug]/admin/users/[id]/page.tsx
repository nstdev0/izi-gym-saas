import { getContainer } from "@/server/di/container";
import UserDetail from "./user-detail";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, ChevronLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Detalle de Usuario",
};

export default async function UserPage({
    params,
}: {
    params: Promise<{ slug: string; id: string }>;
}) {
    const { slug, id } = await params;
    const container = await getContainer();
    const user = await container.getUserByIdController.execute(id);

    if (!user) {
        notFound();
    }

    // Necessary serialization for Client Component
    const userPlain = JSON.parse(JSON.stringify(user));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${slug}/admin/users`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Detalle de Usuario
                    </h1>
                </div>
                <Button asChild>
                    <Link href={`/${slug}/admin/users/${id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Link>
                </Button>
            </div>

            <UserDetail user={userPlain} />
        </div>
    );
}
