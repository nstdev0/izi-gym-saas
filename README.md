# 🏋️ IZI Gym SaaS

**Plataforma SaaS multi-tenant para gestión de gimnasios** — control de miembros, membresías, productos, asistencia, facturación y más.

---

## 🚀 Tech Stack

| Capa | Tecnología |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React 19, Server Components) |
| **Lenguaje** | TypeScript 5 (strict) |
| **Autenticación** | [Clerk](https://clerk.com/) (multi-org, roles, invitaciones) |
| **Base de Datos** | PostgreSQL + [Prisma 7](https://www.prisma.io/) ORM |
| **Validación** | [Zod](https://zod.dev/) (schemas compartidos frontend ↔ backend) |
| **Data Fetching** | [TanStack React Query 5](https://tanstack.com/query) + SSR Hydration |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS 4) |
| **Tablas** | [TanStack Table 8](https://tanstack.com/table) |
| **URL State** | [nuqs](https://nuqs.47ng.com/) (filtros, paginación, búsqueda en URL) |
| **File Upload** | [UploadThing](https://uploadthing.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Estilos** | Tailwind CSS 4 + CSS variables para theming |
| **Package Manager** | pnpm 10 |

---

## 📋 Funcionalidades

- **Multi-Tenancy** — Organizaciones aisladas con slug personalizado
- **Miembros** — CRUD completo, QR para check-in
- **Membresías** — Asignación de planes, estados (activa/pendiente/expirada/cancelada), seguimiento de vigencia
- **Planes** — Gestión de planes de membresía con precios y duración
- **Productos** — Inventario, POS, tipos (producto/servicio), control de stock
- **Asistencia** — Registro por QR o manual, historial
- **Dashboard** — Métricas en tiempo real (ingresos, miembros activos, vencimientos, tendencias)
- **Usuarios/Staff** — Invitaciones via Clerk, roles (Admin/Member)
- **Configuración de Organización** — Branding, facturación, booking, notificaciones, access control
- **Planes SaaS** — Sistema de planes para las organizaciones (Free/Pro/Enterprise)
- **Panel de Super-Admin** — Estadísticas globales, gestión de organizaciones, configuración del sistema
- **Soft Delete + Restore** — Eliminación reversible con undo via toast
- **Theming** — Modo claro/oscuro, color primario personalizable, preferencias por usuario
- **SSR + Hydration** — Prefetch en servidor, hidratación instantánea en cliente
- **UI Skeletons y Carga Progresiva** — Interfaces esqueleto dinámicas con React Suspense que logran que la experiencia de carga sea visualmente agradable e inmediata, previniendo rebotes en los componentes.

---

## 📐 Arquitectura

El proyecto implementa **Clean Architecture** con las siguientes capas:

```
server/
├── domain/           # Entidades, errores, interfaces, value objects
├── application/      # Use cases, repository interfaces, service interfaces
├── infrastructure/   # Prisma repos, mappers, billing, auth services
├── interface-adapters/ # Controllers, response mappers
├── di/               # Container + 9 módulos de factory
└── lib/              # API handler factory (createContext)

shared/               # Tipos Zod, DTOs, paginación (compartido frontend ↔ backend)

hooks/                # React Query custom hooks (1 archivo por módulo)
lib/                  # API clients, fetch client, query keys, nuqs parsers
components/           # UI components (shadcn/ui) + providers
app/
├── (backend)/api/    # Route Handlers (Next.js)
└── (frontend)/       # Pages + layouts (Server/Client components)
```

> 📖 Documentación detallada de arquitectura y patrones en [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## ⚡ Inicio Rápido

### Prerrequisitos

- **Node.js** >= 20
- **pnpm** >= 10
- **PostgreSQL** (local o en la nube)
- Cuentas en: [Clerk](https://clerk.com/), [Stripe](https://stripe.com/), [UploadThing](https://uploadthing.com/)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd izi-gym-saas

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales (ver sección Environment Variables)

# 4. Ejecutar migraciones y generar Prisma Client
pnpm exec prisma migrate dev

# 5. (Opcional) Sembrar datos de prueba
pnpm exec prisma db seed

# 6. Iniciar el servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador.

---

## 🔐 Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL |
| `NODE_ENV` | `development` / `production` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Secret para webhooks de Clerk |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | URL de sign-in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | URL de sign-up |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect después de sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect después de sign-up |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Secret para webhooks de Stripe |
| `UPLOADTHING_TOKEN` | Token de UploadThing |
| `BASE_API_URL` | URL base del API |
| `NEXT_PUBLIC_APP_URL` | URL pública de la app |

---

## 📜 Scripts

| Script | Descripción |
|---|---|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Ejecuta migraciones + build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm lint` | Ejecuta ESLint |
| `pnpm exec prisma studio` | Abre Prisma Studio (GUI para la BD) |
| `pnpm exec prisma migrate dev` | Crea y aplica migraciones |
| `pnpm exec prisma generate` | Regenera Prisma Client |

---

## 🚢 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio en [Vercel](https://vercel.com/)
2. Configura las variables de entorno en el dashboard
3. El `postinstall` script ejecuta `prisma migrate deploy && prisma generate` automáticamente
4. El `build` script ejecuta `prisma migrate deploy && next build`

### PostgreSQL

Se recomienda usar un servicio managed como:
- [Supabase](https://supabase.com/) — PostgreSQL + connection pooling
- [Neon](https://neon.tech/) — Serverless PostgreSQL
- [Railway](https://railway.app/)

---

## 📄 Licencia

Proyecto privado. Todos los derechos reservados.
