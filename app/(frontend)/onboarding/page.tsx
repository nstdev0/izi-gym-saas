"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { useRouter } from "next/navigation";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas y guiones"),
});

export default function OnboardingPage() {
  // const router = useRouter(); // Unused because we use window.location.href for hard reload
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    try {
      // LLAMADA A LA API REST
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Error al crear organización");
      }

      toast.success("¡Gimnasio listo!");

      // Forzar recarga completa para que Clerk/RootPage detecten el cambio de DB
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido Fundador
          </h1>
          <p className="text-sm text-gray-500">
            Vamos a configurar tu espacio de trabajo.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Gimnasio</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Ej: Spartan Gym"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del Panel</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-sm">
                      <span className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        app.com/
                      </span>
                      <Input
                        className="rounded-l-none"
                        disabled={isLoading}
                        placeholder="spartan-gym"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-[0.8rem] text-muted-foreground">
                    Esta será la dirección web de tu panel administrativo.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Configurando..." : "Crear Gimnasio"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
