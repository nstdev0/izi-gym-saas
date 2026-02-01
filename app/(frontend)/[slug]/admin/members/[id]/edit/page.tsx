import MemberForm from "../../components/members-form";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getContainer } from "@/server/di/container";

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function EditMemberPage({ params }: PageProps) {
  const { slug, id } = await params;
  const container = await getContainer();
  const member = await container.getMemberByIdController.execute(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${slug}/admin/members`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar Miembro</h1>
        </div>
      </div>
      <div className="p-4 border rounded-md">
        <MemberForm
          initialData={member}
          isEdit={true}
          redirectUrl={`/${slug}/admin/members`}
        />
      </div>
    </div>
  );
}
