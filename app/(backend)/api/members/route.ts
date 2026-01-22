import { getContainer } from "@/server/di/container";
import { createApiHandler } from "@/server/lib/api-handler";

export const GET = async () => {
  const members = await getContainer().getAllMembersController.execute();
  return Response.json(members);
};

export const POST = createApiHandler(
  (container) => container.createMemberController,
);
