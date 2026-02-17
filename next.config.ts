import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplica CORS a todas las rutas de la API
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // Si tienes múltiples dominios dinámicos, la mejor práctica es reflejar el origen 
          // controlado por un proxy inverso (Vercel/Cloudflare) o listar el principal.
          // Para desarrollo local y producción, Next.js permite configuración dinámica aquí:
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "https://izi-gym-saas.vercel.app"
          },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Clerk
      },
      {
        protocol: "https",
        hostname: "1nur9kntg1.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com"
      }
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
