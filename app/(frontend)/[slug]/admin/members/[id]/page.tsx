import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContainer } from "@/server/di/container";
import MemberForm from "../components/members-form";

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

  // Serialize to avoid Date object issues and consistent formatting
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
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">Gestiona la información del miembro</p>
          </div>
        </div>
      </div>

      <MemberForm initialData={memberPlain} isEdit={true} redirectUrl={`/${slug}/admin/members`} />
    </div>
  );
}
