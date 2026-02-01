import { getContainer } from "@/server/di/container";
import { NextResponse } from "next/server";
import { CreateMemberSchema } from "@/server/application/dtos/members.dto";
import { z } from "zod";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (container) => container.getMemberByIdController,
  async (req: Request, params?: any) => {
    const id = params?.id;
    return id;
  },
);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = CreateMemberSchema.partial().parse(body); // Validate partial update

    const container = await getContainer();
    const member = await container.updateMemberController.execute(
      id,
      validatedData,
    );

    return NextResponse.json(member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Error de validación",
          errors: z.treeifyError(error).errors,
        },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const container = await getContainer();
    await container.deleteMemberController.execute(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
