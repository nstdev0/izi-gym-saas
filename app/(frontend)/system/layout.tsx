import { SystemSidebar } from "@/components/system/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check publicMetadata for GOD role
  if (user.publicMetadata.role !== "GOD") {
    console.log("⛔ Access Denied: User is not GOD", user.id);
    return notFound();
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <SystemSidebar />
      <main className="flex-1 p-8 overflow-y-auto bg-white dark:bg-slate-900">
        {children}
      </main>
    </div>
  );
}
