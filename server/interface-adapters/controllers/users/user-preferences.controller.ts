import { UpdateUserPreferencesUseCase } from "@/server/application/use-cases/users/update-user-preferences.use-case";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export class UpdateUserPreferencesController {
    constructor(private useCase: UpdateUserPreferencesUseCase) { }

    async handle(request: Request) {
        try {
            const { userId } = await auth();

            if (!userId) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await request.json();
            const { preferences } = body;

            if (!preferences) {
                return NextResponse.json({ error: "Missing preferences" }, { status: 400 });
            }

            await this.useCase.execute({ userId, preferences });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
}
