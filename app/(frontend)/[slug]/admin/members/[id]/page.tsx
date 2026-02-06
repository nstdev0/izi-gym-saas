import { getContainer } from "@/server/di/container";
import MemberDetail from "./member-detail";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, ChevronLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalle de Miembro",
};

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const container = await getContainer();
  const member = await container.getMemberByIdController.execute(undefined, id);

  if (!member) {
    notFound();
  }

  // Necessary serialization for Client Component if passing class instance
  // Since Member is a class, but usually serialization strips methods
  // We can pass it directly or spread it.
  const memberPlain = JSON.parse(JSON.stringify(member));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${slug}/admin/members`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Detalle de Miembro
          </h1>
        </div>
        <Button asChild>
          <Link href={`/${slug}/admin/members/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Link>
        </Button>
      </div>

      <MemberDetail member={memberPlain} />
    </div>
  );
}
