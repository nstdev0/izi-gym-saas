import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/server/infrastructure/persistence/prisma";

export async function requireGod() {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
        redirect("/sign-in");
    }

    const godMembership = await prisma.organizationMembership.findFirst({
        where: {
            userId: userId,
            role: "GOD"
        },
        select: { id: true },
    });

    if (!godMembership) {
        redirect("/");
    }

    return { userId };
}
