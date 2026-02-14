import { prisma } from "@/server/infrastructure/persistence/prisma";

interface UpdateUserPreferencesInput {
    userId: string;
    preferences: Record<string, unknown>;
}

export class UpdateUserPreferencesUseCase {
    async execute(input: UpdateUserPreferencesInput): Promise<void> {
        const { userId, preferences } = input;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        if (!user) {
            throw new Error("User not found");
        }

        const currentPreferences = (user.preferences as Record<string, unknown>) || {};

        // Deep merge logic (simplified for 2 levels deep which is enough for now)
        // Structure: { appearance: { font: "start" } }

        const mergedPreferences = { ...currentPreferences };

        for (const [sectionKey, sectionValue] of Object.entries(preferences)) {
            if (typeof sectionValue === 'object' && sectionValue !== null && !Array.isArray(sectionValue)) {
                // It's a section, merge it
                mergedPreferences[sectionKey] = {
                    ...(currentPreferences[sectionKey] as Record<string, unknown> || {}),
                    ...(sectionValue as Record<string, unknown>)
                };
            } else {
                // Primitive value, overwrite
                mergedPreferences[sectionKey] = sectionValue;
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                preferences: mergedPreferences as any
            }
        });
    }
}
