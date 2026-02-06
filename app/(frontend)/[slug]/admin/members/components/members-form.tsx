"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateMemberSchema } from "@/server/application/dtos/members.dto";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Member } from "@/server/domain/entities/Member";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { AvatarUploader } from "@/components/avatar-uploader";

type MemberFormProps = {
  initialData?: Member;
  isEdit?: boolean;
  redirectUrl?: string;
};

export default function MemberForm({
  initialData,
  isEdit = false,
  redirectUrl,
}: MemberFormProps) {
  const router = useRouter();

  // 1. Configuración del Formulario
  const form = useForm<z.infer<typeof CreateMemberSchema>>({
    resolver: zodResolver(CreateMemberSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      docType: (initialData?.docType as any) || "DNI",
      docNumber: initialData?.docNumber || "",
      gender: (initialData?.gender as any) || "MALE",
      isActive: initialData?.isActive ?? true,
      birthDate: initialData?.birthDate ? new Date(initialData.birthDate) : undefined,
      height: initialData?.height ?? undefined,
      weight: initialData?.weight ?? undefined,
      imc: initialData?.imc ?? undefined,
      image: initialData?.image || "",
    },
  });

  // 2. Mutación (Conexión con Backend)
  const { mutate: mutateMember, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof CreateMemberSchema>) => {
      // Clean Architecture: El DTO ya fue validado y transformado por Zod
      if (isEdit && initialData?.id) {
        return api.patch(`/api/members/${initialData.id}`, values);
      }
      return api.post("/api/members", values);
    },
    onSuccess: () => {
      toast.success(
        isEdit ? "Miembro actualizado correctamente" : "Miembro registrado con éxito"
      );
      router.refresh(); // Refresca los Server Components (Tablas)
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
        // Iteramos los errores del backend y los pintamos en el input correspondiente
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field as keyof z.infer<typeof CreateMemberSchema>, {
            type: "server",
            message: messages[0],
          }, { shouldFocus: true });
        });
        toast.error("Revisa los errores marcados en rojo.");
      } else {
        toast.error(error.message || "Error al guardar");
      }
    },
  });

  const onSubmit = (values: z.infer<typeof CreateMemberSchema>) => {
    mutateMember(values);
  };

  const onInvalid = (errors: any) => {
  };

  const selectedDocType = form.watch("docType");

  const getMaxLength = (type: string) => {
    switch (type) {
      case "DNI": return 8;      // DNI es exacto 8
      case "RUC": return 11;     // RUC es exacto 11
      case "CE": return 8;      // CE suele ser hasta 8
      case "PASSPORT": return 12; // Pasaporte varía, 12 es seguro
      default: return 15;
    }
  };

  const getDocNumberPlaceholder = (type: string) => {
    switch (type) {
      case "DNI": return "12345678";
      case "RUC": return "10123456789";
      case "CE": return "E1234567";
      case "PASSPORT": return "PE123456";
      default: return "";
    }
  };

  const currentMaxLength = getMaxLength(selectedDocType);
  const currentDocNumberPlaceholder = getDocNumberPlaceholder(selectedDocType);

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">

      <div className="flex justify-center mb-6">
        <Controller
          name="image"
          control={form.control}
          render={({ field }) => (
            <AvatarUploader
              value={field.value ?? undefined}
              onChange={(url) => {
                // AvatarUploader ya sube la imagen y devuelve la URL
                console.log("Avatar URL recibida:", url);
                field.onChange(url);
              }}
              fileNamePrefix={`${form.getValues("firstName") || "member"}-${form.getValues("lastName") || ""}-${form.getValues("docNumber") || ""}`}
            />
          )}
        />
      </div>

      {/* SECCIÓN: DATOS PERSONALES */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Nombres</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Jon"
                />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Apellidos</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Doe"
                />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="birthDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Fecha Nacimiento</FieldLabel>
                <Input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  aria-invalid={fieldState.invalid}

                  // 1. Simplificación: Pasamos las props de react-hook-form directo
                  // El input date nativo trabaja con strings "YYYY-MM-DD", ¡démosle eso!
                  {...field}

                  // 2. Manejo de nulos: Si es undefined/null, pon string vacío
                  value={field.value ? String(field.value) : ""}
                />

                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      {/* SECCIÓN: CONTACTO */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Email</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                  placeholder="jon@example.com"
                />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Celular</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  aria-invalid={fieldState.invalid}
                  placeholder="9..."
                  maxLength={9}
                />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      {/* SECCIÓN: IDENTIFICACIÓN */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Identificación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <Controller
            name="docType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Tipo de Documento</FieldLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.trigger("docNumber");
                  }}
                  defaultValue={field.value}
                  disabled={isEdit}
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="docNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Número de Documento</FieldLabel>
                <Input
                  {...field}
                  maxLength={currentMaxLength}
                  aria-invalid={fieldState.invalid}
                  placeholder={currentDocNumberPlaceholder}
                  disabled={isEdit}
                  onChange={(e) => {
                    field.onChange(e);
                    if (form.formState.errors.docNumber?.type === 'server') {
                      form.clearErrors("docNumber");
                    }
                  }}
                />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      {/* SECCIÓN: FÍSICO Y MÉDICO */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información Física</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Género</FieldLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="height"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Altura (cm)</FieldLabel>
                <Input
                  maxLength={3}
                  type="number"
                  aria-invalid={fieldState.invalid}
                  placeholder="175"
                  {...field}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="weight"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Peso (kg)</FieldLabel>
                <Input
                  {...field}
                  maxLength={5}
                  type="number"
                  step="0.1"
                  aria-invalid={fieldState.invalid}
                  placeholder="70.5"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    if (e.target.value.length <= 5) {
                      field.onChange(e.target.value);
                    }
                  }}
                />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Guardar Cambios" : "Registrar Miembro"}
        </Button>
      </div>
    </form>
  );
}