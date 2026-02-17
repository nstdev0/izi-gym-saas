import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Definimos rutas públicas explícitas
// Nota: En Enterprise se prefiere "Deny All by Default" (Proteger todo excepto lo listado)
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/public(.*)", // Si tienes endpoints públicos reales
  "/",
  "/pricing(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Protección de Rutas
  // Si la ruta NO es pública, protegemos.
  if (!isPublicRoute(req)) {
    // CORRECCIÓN IMPORTANTE:
    // 'auth' es una función. Debes llamarla 'await auth()' para obtener el contexto.
    await auth.protect();
  }

  // Aquí ya no necesitas lógica de CORS manual.
  // Next.js inyectará los headers definidos en next.config.ts automáticamente.

  return NextResponse.next();
});

export const config = {
  matcher: [
    // El matcher oficial de Clerk optimizado para no ejecutar en estáticos
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Siempre ejecutar en rutas API
    "/(api|trpc)(.*)",
  ],
};