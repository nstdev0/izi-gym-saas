// lib/current-user.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";

export const currentUser = async () => {
  const { userId, orgId } = await auth(); // Clerk nos da esto gratis

  if (!userId || !orgId) return null;

  // Opcional: Si necesitas el rol específico de tu DB
  // Clerk también tiene roles, podrías usar los de Clerk y ahorrarte esta query
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  return {
    id: userId,
    organizationId: orgId, // Usamos la Org activa en Clerk
    role: dbUser?.role || "STAFF",
  };
};
