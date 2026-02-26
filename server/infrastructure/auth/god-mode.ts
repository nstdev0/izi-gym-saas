import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/server/infrastructure/persistence/prisma";

export async function requireGodMode() {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
        redirect("/sign-in");
    }

    const isGod = await prisma.organizationMembership.findFirst({
        where: {
            userId: userId,
            role: "GOD"
        }
    });

    if (!isGod) {
        console.warn(`Access denied to GOD Mode for user ${userId}. Not a GOD role.`);
        redirect("/");
    }

    return { userId };
}
