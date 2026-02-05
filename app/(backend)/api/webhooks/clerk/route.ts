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
    const { id, name, slug, created_by } = evt.data;

    console.log(`🏢 Nueva Organización detectada en Clerk: ${name} (${slug})`);

    try {
      // 1. Buscamos el plan Gratuito por defecto
      const freePlan = await prisma.organizationPlan.findUnique({
        where: { slug: "free-trial" },
      });

      if (!freePlan) {
        console.error("❌ ERROR CRÍTICO: No existe el plan 'free-trial' en la DB.");
        return new Response("Plan not found", { status: 500 });
      }

      // 2. Transacción: Crear Org + Suscripción + Vincular Creador
      await prisma.$transaction(async (tx) => {
        // A. Crear la Organización en Postgres
        const newOrg = await tx.organization.create({
          data: {
            id: id, // IMPORTANTE: Usar el mismo ID de Clerk
            name: name,
            slug: slug, // Clerk te dará algo como "olimpo-gym-42a1"
            organizationPlanId: freePlan.id,
            isActive: true,
          },
        });

        // B. Crear Suscripción Trial
        await tx.subscription.create({
          data: {
            organizationId: newOrg.id,
            organizationPlanId: freePlan.id,
            status: "TRIALING",
            currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
          },
        });

        // C. Vincular al usuario creador (Owner)
        if (created_by) {
          // Primero intentamos actualizar si ya existe
          // Pero si el webhook de usuario no ha llegado, podríamos necesitar crearlo (JIT)
          // Para simplificar y seguir la petición del usuario, usaremos update, 
          // pero si falla, es responsabilidad del webhook de usuario llegar.
          // Sin embargo, el usuario sugirió JIT antes. 
          // En este snippet solicitado por el usuario, usan tx.user.update directo.
          // Lo haré como pidió, pero agregaré el catch para no romper toda la transacción si el user no está.

          try {
            await tx.user.update({
              where: { id: created_by },
              data: {
                organizationId: newOrg.id,
                role: "OWNER",
              },
            });
          } catch (e) {
            console.warn(`User ${created_by} not found in DB yet. Waiting for user.created webhook.`);
          }
        }
      });
      console.log(`✅ Organización creada y sincronizada: ${name}`);
    } catch (error) {
      console.error("❌ Error creando organización en DB:", error);
      return new Response("Error creating organization in DB", { status: 500 });
    }
  }

  // CASO 2: Un usuario se une a una Organización (o la crea y se une automáticamente)
  if (eventType === "organizationMembership.created") {
    const { organization, public_user_data, public_metadata } = evt.data;

    try {
      // Upsert: Crear si no existe, actualizar si ya existía (ej: re-invitación)
      // Esto maneja el caso de "Invitación a Organización" que crea al usuario directamente en este evento si no existe
      await prisma.user.upsert({
        where: { id: public_user_data.user_id },
        create: {
          id: public_user_data.user_id,
          email: public_user_data.identifier,
          firstName: public_user_data.first_name || "Miembro",
          lastName: public_user_data.last_name || "",
          organizationId: organization.id,
          // Leemos el rol específico desde metadata de la invitación (si existe), o fallback a STAFF
          role: (public_metadata?.appRole as any) || "STAFF",
          isActive: true,
          image: public_user_data.image_url,
          passwordHash: "OAUTH_MANAGED"
        },
        update: {
          organizationId: organization.id,
          isActive: true, // Reactivar si estaba inactivo
          // Actualizar rol si viene en metadata (re-invitación con nuevo rol)
          ...(public_metadata?.appRole ? { role: public_metadata.appRole as any } : {})
        }
      });

      console.log(
        `🔗 Nuevo miembro upserted en Org ${organization.id}: ${public_user_data.identifier}`,
      );
    } catch (error) {
      console.error("❌ Error vinculando/creando usuario:", error);
      // No devolvemos 500 aquí para no reintentar infinitamente si falla algo puntual
    }
  }

  if (eventType === "user.created") {
    const { id, email_addresses, public_metadata, image_url, first_name, last_name } = evt.data;

    // OrganizationId can be optional (orphan users)
    const organizationId = (public_metadata.organizationId as string) || null;
    const role = (public_metadata.role as string) || "OWNER"; // Default fallback (maybe Member is safer, but keeping owner-ish behavior for self-signups if any)

    try {
      await prisma.user.upsert({
        where: {
          id: id,
        },
        create: {
          id: id,
          email: email_addresses[0].email_address,
          image: image_url,
          role: role as any,
          passwordHash: "OAUTH_MANAGED",
          organizationId: organizationId,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          isActive: true,
        },
        update: {
          email: email_addresses[0].email_address,
          image: image_url,
          // Only update organization if provided in metadata during a re-creation/invite flow
          ...(organizationId ? { organizationId } : {}),
          // Update names if changed
          ...(first_name ? { firstName: first_name } : {}),
          ...(last_name ? { lastName: last_name } : {}),
        },
      });
      console.log(`✅ User created/upserted: ${id} with role ${role}`);
    } catch (error) {
      console.error("❌ Error upserting user:", error);
      return new Response("Error upserting user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, image_url } = evt.data;

    try {
      await prisma.user.update({
        where: { id: id },
        data: {
          email: email_addresses[0].email_address,
          image: image_url,
        },
      });
      console.log(`🔄 User updated: ${id}`);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      // Don't error out if user doesn't exist to avoid retry loops
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("No user ID found", { status: 400 });
    }

    try {
      await prisma.user.delete({
        where: { id: id },
      });
      console.log(`🗑️ User deleted: ${id}`);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  }

  // Manejar user.updated y user.deleted también...

  return new Response("", { status: 200 });
}
