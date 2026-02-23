import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getClerkWebhookContainer } from "@/server/di/container";

export async function POST(req: Request) {
  // 1. Verificación de firma
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) throw new Error("Falta el CLERK_WEBHOOK_SECRET");

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Faltan headers svix", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const webhook = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verificando webhook:", err);
    return new Response("Error verificando webhook", { status: 400 });
  }

  const eventType = event.type;
  console.log(`📨 Webhook recibido: ${eventType}`);

  try {
    const container = await getClerkWebhookContainer();

    switch (eventType) {
      case "user.created":
      case "user.updated": {
        const data = event.data;
        await container.syncUserUseCase.execute({
          id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          firstName: data.first_name || null,
          lastName: data.last_name || null,
          image: data.image_url || null,
        });
        break;
      }

      case "user.deleted": {
        const { id } = event.data;
        if (id) {
          await container.deleteUserUseCase.execute(id);
        }
        break;
      }

      case "organization.created":
      case "organization.updated": {
        const data = event.data;
        await container.syncOrganizationUseCase.execute({
          id: data.id,
          name: data.name,
          slug: data.slug || null,
          image: data.image_url || null,
        });
        break;
      }

      case "organization.deleted": {
        const data = event.data;
        if (data.id) {
          await container.deleteOrganizationUseCase.execute(data.id);
        }
        break;
      }

      case "organizationMembership.created": {
        const data = event.data;
        const organization = data.organization;

        await container.syncMembershipUseCase.execute({
          userId: data.public_user_data.user_id,
          email: data.public_user_data.identifier,
          firstName: data.public_user_data.first_name || null,
          lastName: data.public_user_data.last_name || null,
          image: data.public_user_data.image_url || null,
          role: data.role,
          organization: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug || null,
            image: organization.image_url || null,
          }
        });
        break;
      }

      case "organizationMembership.deleted": {
        const data = event.data;
        if (data.public_user_data?.user_id) {
          await container.removeMembershipUseCase.execute(data.public_user_data.user_id);
        }
        break;
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error procesando webhook:", error);
    if (error.message?.includes("Plan 'free-trial' no encontrado")) {
      return new Response("Plan faltante", { status: 500 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}