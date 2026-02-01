import { getContainer } from "@/server/di/container";
import { createContext } from "@/server/lib/api-handler";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = createContext(
  (container) => container.getUserByIdController,
  async (req: Request, params: any) => {
    const id = params?.id;
    if (!id) throw new Error("ID no proporcionado");
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

    const container = await getContainer();
    const user = await container.updateUserController.execute(id, body);

    return NextResponse.json(user);
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
    await container.deleteUserController.execute(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
