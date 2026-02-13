import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { Role } from "@/generated/prisma/client";

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
    // PRE-FETCH: Plan Default (con manejo de error si no existe)
    const freePlan = await prisma.organizationPlan.findUnique({
      where: { slug: "free-trial" },
    });

    if (!freePlan) {
      // Retornamos 500 para que Clerk reintente más tarde (cuando hayas corrido el seed)
      console.error("❌ CRÍTICO: Plan 'free-trial' no encontrado. Clerk reintentará.");
      return new Response("Plan faltante, reintentando...", { status: 500 });
    }

    switch (eventType) {
      // ------------------------------------------------------------------
      // CASO 1: USUARIO (CREATE / UPDATE)
      // ------------------------------------------------------------------
      case "user.created":
      case "user.updated": {
        // Casting explícito para tener autocompletado seguro
        const data = event.data;
        const email = data.email_addresses?.[0]?.email_address;
        const userId = data.id;

        if (email) {
          // Buscamos cualquier usuario con ese email, ignorando la Org por ahora para detectar el conflicto
          const existingUser = await prisma.user.findFirst({
            where: { email: email },
          });

          if (existingUser && existingUser.id !== userId) {
            console.log(`🧟 Zombie detectado: ${email}. Eliminando ID antiguo ${existingUser.id}...`);
            await prisma.user.delete({ where: { id: existingUser.id } });
          }
        }

        await prisma.user.upsert({
          where: { id: userId },
          create: {
            id: userId,
            email: email || "", // Manejar caso raro sin email
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            image: data.image_url || null,
            role: Role.STAFF,
            isActive: true,
          },
          update: {
            email: email || undefined,
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            image: data.image_url || null,
          }
        });
        console.log(`👤 Usuario procesado: ${email}`);
        break;
      }

      // ------------------------------------------------------------------
      // CASO 2: USUARIO ELIMINADO
      // ------------------------------------------------------------------
      case "user.deleted": {
        const { id } = event.data;
        if (!id) break;

        try {
          await prisma.user.delete({ where: { id } });
          console.log(`🗑️ Usuario eliminado: ${id}`);
        } catch (error: any) {
          // P2025: Record to delete does not exist.
          if (error?.code !== 'P2025') throw error;
        }
        break;
      }

      // ------------------------------------------------------------------
      // CASO 3: ORGANIZACIÓN CREADA
      // ------------------------------------------------------------------
      case "organization.created": {
        const data = event.data;

        await prisma.$transaction(async (tx) => {
          // Upsert es vital por si membership.created llegó primero
          await tx.organization.upsert({
            where: { id: data.id },
            update: {
              name: data.name,
              slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
              image: data.image_url,
            },
            create: {
              id: data.id,
              name: data.name,
              slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
              image: data.image_url,
              organizationPlanId: freePlan.id
            },
          });

          // Crear suscripción si no existe
          const sub = await tx.subscription.findUnique({
            where: { organizationId: data.id }
          });

          if (!sub) {
            await tx.subscription.create({
              data: {
                organizationId: data.id,
                organizationPlanId: freePlan.id,
                status: "TRIALING",
                currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              },
            });
          }
        });
        console.log(`✅ Organización procesada: ${data.name}`);
        break;
      }

      // ------------------------------------------------------------------
      // CASO 4: MEMBRESÍA CREADA (RACE CONDITION HANDLER)
      // ------------------------------------------------------------------
      case "organizationMembership.created": {
        const data = event.data;
        const organization = data.organization;
        const email = data.public_user_data.identifier;
        const userId = data.public_user_data.user_id;

        // Limpieza de Zombies (igual que en user.created por seguridad)
        if (email) {
          const existingUser = await prisma.user.findFirst({ where: { email } });
          if (existingUser && existingUser.id !== userId) {
            await prisma.user.delete({ where: { id: existingUser.id } });
          }
        }

        // Mapeo de Roles
        let appRole: Role = Role.STAFF;
        if (data.role === "org:admin") appRole = Role.ADMIN; // Asumimos Admin temporalmente

        await prisma.user.upsert({
          where: { id: userId },
          create: {
            id: userId,
            email: email,
            firstName: data.public_user_data.first_name || null,
            lastName: data.public_user_data.last_name || null,
            image: data.public_user_data.image_url || null,
            role: appRole,
            isActive: true,
            // ✨ Conexión Race-Condition Proof ✨
            organization: {
              connectOrCreate: {
                where: { id: organization.id },
                create: {
                  id: organization.id,
                  name: organization.name,
                  slug: organization.slug || organization.name,
                  image: organization.image_url,
                  organizationPlanId: freePlan.id
                }
              }
            }
          },
          update: {
            role: appRole,
            isActive: true,
            organization: {
              connectOrCreate: {
                where: { id: organization.id },
                create: {
                  id: organization.id,
                  name: organization.name,
                  slug: organization.slug || organization.name,
                  image: organization.image_url,
                  organizationPlanId: freePlan.id
                }
              }
            }
          }
        });
        console.log(`🔗 Membresía vinculada: ${email} -> ${organization.name}`);
        break;
      }

      // ------------------------------------------------------------------
      // CASO 5: MEMBRESÍA ELIMINADA
      // ------------------------------------------------------------------
      case "organizationMembership.deleted": {
        const data = event.data;
        try {
          await prisma.user.update({
            where: { id: data.public_user_data.user_id },
            data: { organizationId: null, isActive: false }
          });
        } catch (error: any) {
          if (error?.code !== 'P2025') throw error;
        }
        break;
      }

      // ------------------------------------------------------------------
      // CASO 6: ORGANIZACIÓN ACTUALIZADA
      // ------------------------------------------------------------------
      case "organization.updated": {
        const data = event.data;
        try {
          await prisma.organization.update({
            where: { id: data.id },
            data: {
              name: data.name,
              slug: data.slug || undefined,
              image: data.image_url || undefined
            }
          });
        } catch (error: any) {
          // Si no existe, no hacemos nada (esperamos al evento created)
          if (error?.code !== 'P2025') throw error;
        }
        break;
      }

      case "organization.deleted": {
        const data = event.data;
        try {
          await prisma.organization.delete({
            where: { id: data.id }
          });
        } catch (error: any) {
          if (error?.code !== 'P2025') throw error;
        }
        break;
      }

    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Error procesando webhook:", error);
    // Retornamos 500 para que Clerk sepa que falló y reintente
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}