import UserForm from "../components/users-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function NewUserPage({ params }: PageProps) {
    const { slug } = await params;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${slug}/admin/users`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h1>
                </div>
            </div>

            <UserForm redirectUrl={`/${slug}/admin/users`} />
        </div>
    );
}
