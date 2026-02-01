import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Verificar firma (Seguridad: Asegurar que viene de Clerk)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Error occured", { status: 400 });
  }

  // --- LÓGICA DE NEGOCIO ---
  const eventType = evt.type;

  // CASO 1: Se crea una Organización en Clerk
  if (eventType === "organization.created") {
    const { id, name, slug } = evt.data;

    try {
      await prisma.organization.create({
        data: {
          id: id, // IMPORTANTE: Usamos el ID de Clerk como Primary Key
          name: name,
          slug: name.toLowerCase().replace(/\s/g, "-"),
          isActive: true,
          plan: {
            connect: { slug: "free-trial" },
          },
        },
      });
      console.log(`✅ Organización creada en DB: ${name} (${id})`);
    } catch (error) {
      console.error("❌ Error creando organización en DB:", error);
      return new Response("Error creating organization in DB", { status: 500 });
    }
  }

  // CASO 2: Un usuario se une a una Organización (o la crea y se une automáticamente)
  if (eventType === "organizationMembership.created") {
    const { organization, public_user_data } = evt.data;

    try {
      // Actualizamos el usuario en nuestra DB para vincularlo a la Org
      await prisma.user.update({
        where: { id: public_user_data.user_id }, // Buscamos por ID de usuario
        data: {
          organizationId: organization.id,
          // Aquí podrías mapear el rol de Clerk a tu rol de Prisma si quisieras
        },
      });
      console.log(
        `🔗 Usuario ${public_user_data.user_id} vinculado a ${organization.id}`,
      );
    } catch (error) {
      console.error("❌ Error vinculando usuario:", error);
      // No devolvemos 500 aquí para no reintentar infinitamente si el usuario no existe aún
    }
  }

  if (eventType === "user.created") {
    const { id, email_addresses, public_metadata } = evt.data;

    // Clerk maneja organizaciones nativamente, o puedes pasarlo en metadata al invitar
    // Asumamos que al invitar, pasaste organizationId en public_metadata
    const organizationId = public_metadata.organizationId as string;

    try {
      await prisma.user.upsert({
        where: {
          id: id,
        },
        create: {
          id: id,
          email: email_addresses[0].email_address,
          role: "OWNER",
          passwordHash: "OAUTH_MANAGED",
          organizationId: organizationId,
        },
        update: {
          email: email_addresses[0].email_address,
        },
      });
    } catch (error) {
      console.error("❌ Error upserting user:", error);
      // Prevent 500 loop
    }
  }

  // Manejar user.updated y user.deleted también...

  return new Response("", { status: 200 });
}
