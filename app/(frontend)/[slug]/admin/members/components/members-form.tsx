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
import { Loader2, Save, User, FileBadge, Phone, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import { useCreateMember, useUpdateMember } from "@/hooks/members/use-members";
import { Member } from "@/server/domain/entities/Member";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { AvatarUploader } from "@/components/avatar-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      docType: (initialData?.docType as any) || "DNI",
      docNumber: initialData?.docNumber || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gender: (initialData?.gender as any) || "MALE",
      isActive: initialData?.isActive ?? true,
      birthDate: initialData?.birthDate ? new Date(initialData.birthDate) : undefined,
      height: initialData?.height ?? undefined,
      weight: initialData?.weight ?? undefined,
      imc: initialData?.imc ?? undefined,
      image: initialData?.image || "",
      qr: initialData?.qr || "",
    },
  });

  const { mutate: createMember, isPending: isCreating } = useCreateMember();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();
  const isPending = isCreating || isUpdating;
  const isDirty = form.formState.isDirty;
  const canSubmit = isEdit ? isDirty : true;

  const onSubmit = (values: z.infer<typeof CreateMemberSchema>) => {
    const onSuccess = () => {
      router.refresh();
      if (redirectUrl) router.push(redirectUrl);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">

      {/* ====================================================================
          CARD 1: PERFIL VISUAL + INFORMACIÓN PERSONAL BÁSICA
          Lado Izquierdo: Imagen y QR
          Lado Derecho: Nombres, Apellidos, Fecha Nacimiento
      ==================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Perfil del Miembro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

            {/* COLUMNA IZQUIERDA (Visuals) - md:col-span-4 */}
            <div className="md:col-span-4 flex flex-col items-center space-y-6 border-r-0 md:border-r md:pr-6 border-border/50">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fotografía</span>
                <Controller
                  name="image"
                  control={form.control}
                  render={({ field }) => (
                    <AvatarUploader
                      value={field.value ?? undefined}
                      onChange={(url) => field.onChange(url)}
                      fileNamePrefix={`${form.getValues("firstName")}-${form.getValues("lastName")}`}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col items-center space-y-2 w-full">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Código QR</span>
                {initialData?.qr ? (
                  <div className="bg-white p-3 rounded-xl border shadow-sm w-full max-w-[160px] aspect-square flex items-center justify-center">
                    <QRCode
                      value={initialData.qr}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-[160px] aspect-square bg-muted/30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-muted-foreground gap-2">
                    <span className="text-xs text-center px-2">Se generará al guardar</span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA (Datos Personales) - md:col-span-8 */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Nombres</FieldLabel>
                      <Input {...field} aria-invalid={fieldState.invalid} placeholder="Ej. Juan Carlos" />
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
                      <Input {...field} aria-invalid={fieldState.invalid} placeholder="Ej. Pérez López" />
                      {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="birthDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel optional>Fecha de Nacimiento</FieldLabel>
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
          </div>
        </CardContent>
      </Card>

      {/* ====================================================================
          CARD 2: IDENTIFICACIÓN (DNI, DocNumber)
      ==================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBadge className="h-5 w-5 text-primary" />
            Identificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-1/3 min-w-[100px]">
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
                        <SelectValue placeholder="Tipo" />
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
            <div className="flex-1">
              <Controller
                name="docNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>Número de Documento</FieldLabel>
                    <Input
                      {...field}
                      maxLength={getMaxLength(selectedDocType)}
                      aria-invalid={fieldState.invalid}
                      placeholder={getDocNumberPlaceholder(selectedDocType)}
                      disabled={isEdit}
                    />
                    {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================================
          CARD 3: CONTACTO (Email, Celular)
      ==================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel optional>Correo Electrónico</FieldLabel>
                  <Input {...field} value={field.value ?? ""} aria-invalid={fieldState.invalid} placeholder="cliente@email.com" />
                  {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel optional>Celular / WhatsApp</FieldLabel>
                  <Input {...field} value={field.value ?? ""} aria-invalid={fieldState.invalid} placeholder="999 999 999" maxLength={9} />
                  {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* ====================================================================
          CARD 4: DATOS FÍSICOS (Gender, Height, Weight)
      ==================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Datos Físicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex justify-end gap-4 sticky bottom-4 z-10">
        <Button type="submit" disabled={isPending || !canSubmit} size="lg">
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? "Guardar Cambios" : "Crear Miembro"}
        </Button>
      </div>
    </form>
  );
}