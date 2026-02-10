"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
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
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useCreateMember, useUpdateMember } from "@/hooks/members/use-members";
import { Member } from "@/server/domain/entities/Member";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { AvatarUploader } from "@/components/avatar-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MemberFormProps = {
  initialData?: Member;
  isEdit?: boolean;
  redirectUrl?: string; // Mantener por compatibilidad, pero el submit manejará la redirección/refresh
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
  const { mutate: createMember, isPending: isCreating } = useCreateMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();

  const isPending = isCreating || isUpdating;

  // Detectar cambios para habilitar/deshabilitar botón de guardar
  const isDirty = form.formState.isDirty;

  // Si estamos en modo edición (hay initialData), el botón solo se habilita si hay cambios (isDirty).
  // Si estamos en modo creación, el botón siempre está habilitado (salvo isPending).
  const canSubmit = isEdit ? isDirty : true;

  const onSubmit = (values: z.infer<typeof CreateMemberSchema>) => {
    const onSuccess = () => {
      toast.success(isEdit ? "Miembro actualizado exitosamente" : "Miembro creado exitosamente");
      router.refresh();
      if (redirectUrl) {
        // Opcional: Redirigir si se requiere
      }
    };

    const onError = (error: any) => {
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field as keyof z.infer<typeof CreateMemberSchema>, {
            type: "server",
            message: messages[0],
          }, { shouldFocus: true });
        });
        toast.error("Revisa los errores marcados en rojo.");
      }
    };

    if (isEdit && initialData?.id) {
      updateMember({ id: initialData.id, data: values }, { onSuccess, onError });
    } else {
      createMember(values, { onSuccess, onError });
    }
  };

  const onInvalid = (errors: any) => {
    console.log(errors);
    toast.error("Por favor completa los campos requeridos");
  };

  const selectedDocType = form.watch("docType");

  const getMaxLength = (type: string) => {
    switch (type) {
      case "DNI": return 8;
      case "RUC": return 11;
      case "CE": return 12;
      case "PASSPORT": return 12;
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
    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* CONTENEDOR PRINCIPAL: Avatar + Datos Personales */}
      <div className="md:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* ZONA AVATAR (Izquierda en desktop) */}
              <div className="md:col-span-3 flex flex-col items-center">
                <Controller
                  name="image"
                  control={form.control}
                  render={({ field }) => (
                    <AvatarUploader
                      value={field.value ?? undefined}
                      onChange={(url) => field.onChange(url)}
                      fileNamePrefix={`${form.getValues("firstName") || "member"}-${form.getValues("lastName") || "avatar"}`}
                    />
                  )}
                />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Sube una foto de perfil para identificar al miembro.
                </p>
              </div>

              {/* ZONA CAMPOS (Derecha en desktop) */}
              <div className="md:col-span-9 grid gap-6">
                {/* Nombres y Apellidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel required>Nombres</FieldLabel>
                        <Input {...field} aria-invalid={fieldState.invalid} placeholder="Jon" />
                        {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel required>Apellidos</FieldLabel>
                        <Input {...field} aria-invalid={fieldState.invalid} placeholder="Doe" />
                        {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                {/* Documento e Info Adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <div className="w-1/3">
                      <Controller
                        name="docType"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel required>Tipo</FieldLabel>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                                form.trigger("docNumber");
                              }}
                              defaultValue={field.value}
                              disabled={isEdit}
                            >
                              <SelectTrigger aria-invalid={fieldState.invalid}>
                                <SelectValue placeholder="Sel." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DNI">DNI</SelectItem>
                                <SelectItem value="CE">CE</SelectItem>
                                <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                                <SelectItem value="RUC">RUC</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                        )}
                      />
                    </div>
                    <div className="w-2/3">
                      <Controller
                        name="docNumber"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel required>Número Documento</FieldLabel>
                            <Input
                              {...field}
                              maxLength={currentMaxLength}
                              aria-invalid={fieldState.invalid}
                              placeholder={currentDocNumberPlaceholder}
                              disabled={isEdit}
                            />
                            {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                          </Field>
                        )}
                      />
                    </div>
                  </div>

                  <Controller
                    name="birthDate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel optional>Fecha Nacimiento</FieldLabel>
                        <Input
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          aria-invalid={fieldState.invalid}
                          {...field}
                          value={field.value ? String(field.value) : ""}
                        />
                        {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                {/* Contacto (Integrado) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel optional>Email</FieldLabel>
                        <Input {...field} value={field.value ?? ""} aria-invalid={fieldState.invalid} placeholder="jon@example.com" />
                        {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel optional>Celular</FieldLabel>
                        <Input {...field} value={field.value ?? ""} aria-invalid={fieldState.invalid} placeholder="9..." maxLength={9} />
                        {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos Físicos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel optional>Género</FieldLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Masculino</SelectItem>
                      <SelectItem value="FEMALE">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="height"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel optional>Altura (cm)</FieldLabel>
                  <Input
                    maxLength={3}
                    type="number"
                    aria-invalid={fieldState.invalid}
                    placeholder="175"
                    {...field}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </Field>
              )}
            />
            <Controller
              name="weight"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel optional>Peso (kg)</FieldLabel>
                  <Input
                    {...field}
                    maxLength={5}
                    type="number"
                    step="0.1"
                    aria-invalid={fieldState.invalid}
                    placeholder="70.5"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      if (e.target.value.length <= 5) field.onChange(e.target.value);
                    }}
                  />
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          {/* Botón Principal */}
          <Button type="submit" disabled={isPending || !canSubmit}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Guardar Cambios" : "Crear Miembro"}
          </Button>
        </div>
      </div>
    </form>
  );
}