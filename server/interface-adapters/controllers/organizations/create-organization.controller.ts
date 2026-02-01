import { CreateOrganizationUseCase } from "@/server/application/use-cases/organizations/create-organization.use-case";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createOrganizationSchema } from "@/server/application/dtos/organizations.dto";

export class CreateOrganizationsController {
  constructor(private readonly useCase: CreateOrganizationUseCase) {}

  async execute(req: NextRequest): Promise<NextResponse> {
    try {
      const { userId } = await auth();
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const validation = createOrganizationSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(validation.error.issues, { status: 400 });
      }

      const organization = await this.useCase.execute(validation.data, userId);

      return NextResponse.json(organization);
    } catch (error: any) {
      console.error("[CREATE_ORG_ERROR]", error);
      // Podríamos tener un mapper de errores de dominio a HTTP status
      if (error.message === "Este URL ya está en uso") {
        return new NextResponse(error.message, { status: 409 });
      }
      return new NextResponse(error.message || "Internal Server Error", {
        status: 500,
      });
    }
  }
}
