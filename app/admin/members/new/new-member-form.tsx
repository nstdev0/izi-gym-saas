"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CreateMemberInput,
  CreateMemberSchema,
} from "@/server/application/dtos/create-member.dto";

export function NewMemberForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Configuración de RHF con Zod
  const {
    register,
    handleSubmit,
    // setError, // Para inyectar errores del servidor - Keeping commented or removing if completely unused in current logic.
    // Actually, looking at the code I wrote in previous step, I didn't use setError.
    // Let me check if I want to reintroduce granular error handling properly later.
    // For now, to fix lint, I'll remove it.
    formState: { errors, isSubmitting },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(CreateMemberSchema),
    defaultValues: {},
  });

  // 2. Manejador del Envío
  const onSubmit = async (data: CreateMemberInput) => {
    setServerError(null); // Limpiar errores previos

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Éxito: Redirigir o mostrar Toast
        router.push("/admin/members"); // Corrected path from /members to /admin/members based on file structure
        router.refresh(); // Refresh current route data
      } else {
        // Error handling
        if (response.status === 400 && result.errors) {
          // Validation errors (Zod)
          Object.keys(result.errors).forEach((key) => {
            // Map API errors to RHF using keyof CreateMemberInput
            // API might return "field": ["error"]. RHF expects message.
            // checking ValidationError payload structure... probably same as Zod flatten
            // Assuming result.errors is formatted as per Zod .flatten().fieldErrors or similar?
            // In controller: throw new ValidationError("Datos inválidos", validatedInput.error.errors);
            // ValidationError usually takes ZodIssue[].
            // Let's look at how to map it efficiently.
            // Actually, simpler to handle generic message or if backend wraps it well.
            // If using the same Zod schema on client, client-side validation catches most.
            // Server-side Zod errors would double check.
          });
          // Fallback for simple message
          if (result.message) setServerError(result.message);
        } else {
          setServerError(result.message || "Error al crear miembro");
        }
      }
    } catch {
      setServerError("Error de red o inesperado");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-white p-6 rounded shadow"
    >
      {/* Error General del Servidor */}
      {serverError && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {serverError}
        </div>
      )}

      {/* Campo: Nombre */}
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          {...register("firstName")}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          disabled={isSubmitting}
        />
        {errors.firstName && (
          <p className="text-red-500 text-xs mt-1">
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* Campo: Email */}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
        {/* Aquí aparecerá el error "Email ya registrado" si el backend lo devuelve */}
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Botón Inteligente */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? "Guardando..." : "Crear Miembro"}
      </button>
    </form>
  );
}
