import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/server/di/container";
import { apiHandler } from "@/server/lib/api-handler";

export const GET = async () => {
  const members = await getContainer().getAllMembersController.execute();
  return Response.json(members);
};

export const POST = apiHandler(async (req: NextRequest) => {
  const data = await req.json();
  const member = await getContainer().createMemberController.execute(data);
  return NextResponse.json(member, { status: 201 });
});
