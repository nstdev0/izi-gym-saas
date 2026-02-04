import { SystemSidebar } from "@/components/system/sidebar";
import { getContainer } from "@/server/di/container";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    console.log("❌ SystemLayout: No userId found in session");
    redirect("/sign-in");
  }

  const container = await getContainer();
  let user;

  console.log("USERID", userId);

  try {
    user = await container.getUserByIdController.execute(userId);
  } catch (e) {
    console.error("SystemLayout: User not found or error", e);
    // User not in DB -> Access Denied
    // currently we return notFound() which behaves like "Access Denied" for this route
    return notFound();
  }

  // --- DEBUG LOGS (Remove later) ---
  console.log("USER:", user);
  console.log("🔍 SYSTEM ACCESS CHECK:");
  console.log("👉 Clerk User ID:", userId);
  console.log("👉 DB User Found (via Controller):", user);
  console.log("👉 Role in DB:", user.role);
  console.log("👉 Match Condition:", user.role === "GOD");
  // --------------------------------

  if (user.role !== "GOD") {
    console.log("⛔ Access Denied: User is not GOD");
    return notFound();
  }

  return (
    // ... your JSX
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <SystemSidebar />{" "}
      {/* Menú: "Gimnasios", "Planes Globales", "Facturación SaaS" */}
      <main className="flex-1 p-8 overflow-y-auto bg-white dark:bg-slate-900">
        {children}
      </main>
    </div>
  );
}
