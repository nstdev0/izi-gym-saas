"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
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
import { CreateUserSchema } from "@/server/application/dtos/users.dto";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { User } from "@/server/domain/entities/User";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { AvatarUploader } from "@/components/avatar-uploader";

type UserFormProps = {
    initialData?: User;
    isEdit?: boolean;
    redirectUrl?: string;
};

// Roles permitidos según requerimientos (excluye GOD)
const ALLOWED_ROLES = ["OWNER", "ADMIN", "STAFF", "TRAINER"];

export default function UserForm({
    initialData,
    isEdit = false,
    redirectUrl,
}: UserFormProps) {
    const router = useRouter();

    const form = useForm<z.infer<typeof CreateUserSchema>>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
            email: initialData?.email || "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            role: (initialData?.role as any) || "STAFF",
            isActive: initialData?.isActive ?? true,
            image: initialData?.image || "",
            firstName: initialData?.firstName || "",
            lastName: initialData?.lastName || "",
        },
    });

    const isActive = useWatch({ control: form.control, name: "isActive" });

    const { mutate: mutateUser, isPending } = useMutation({
        mutationFn: async (values: z.infer<typeof CreateUserSchema>) => {
            if (isEdit && initialData?.id) {
                return api.patch(`/api/users/${initialData.id}`, values);
            }
            return api.post("/api/users", values);
        },
        onSuccess: () => {
            toast.success(
                isEdit ? "Usuario actualizado correctamente" : "Invitación enviada con éxito"
            );
            router.refresh();
            if (redirectUrl) {
                router.push(redirectUrl);
            }
        },
        onError: (error) => {
            if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
                Object.entries(error.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof z.infer<typeof CreateUserSchema>, {
                        type: "server",
                        message: (messages as string[])[0],
                    });
                });
            } else if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error("Ocurrió un error inesperado");
            }
        },
    });

    const onSubmit = (values: z.infer<typeof CreateUserSchema>) => {
        mutateUser(values);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto py-6">
            {!isEdit && (
                <div className="bg-gray-600 p-4 rounded-md border border-blue-200 text-sm text-primary-foreground">
                    ℹ️ Se enviará una invitación por correo. El usuario podrá elegir iniciar sesión con <strong>Google</strong> o crear una contraseña.
                </div>
            )}

            <div className="flex justify-center mb-8">
                <Controller
                    name="image"
                    control={form.control}
                    render={({ field }) => (
                        <AvatarUploader
                            value={field.value ?? undefined}
                            onChange={(url) => field.onChange(url)}
                            fileNamePrefix={`user-${form.getValues("email").split("@")[0]}`}
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombres (Opcional, pero útil para la invitación) */}
                <Field>
                    <FieldLabel>Nombre (Opcional)</FieldLabel>
                    <Input
                        placeholder="Juan"
                        {...form.register("firstName")}
                    />
                    <FieldError errors={[form.formState.errors.firstName]} />
                </Field>

                <Field>
                    <FieldLabel>Apellido (Opcional)</FieldLabel>
                    <Input
                        placeholder="Pérez"
                        {...form.register("lastName")}
                    />
                    <FieldError errors={[form.formState.errors.lastName]} />
                </Field>

                {/* Email */}
                <Field className="col-span-2">
                    <FieldLabel required>Email</FieldLabel>
                    <Input
                        placeholder="usuario@ejemplo.com"
                        {...form.register("email")}
                        disabled={isEdit}
                    />
                    <FieldError errors={[form.formState.errors.email]} />
                </Field>

                {/* Role */}
                <Field>
                    <FieldLabel required>Rol</FieldLabel>
                    <Controller
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALLOWED_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <FieldError errors={[form.formState.errors.role]} />
                </Field>

                {/* Estado */}
                <Field>
                    <FieldLabel>Estado</FieldLabel>
                    <Controller
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <Select
                                onValueChange={(val) => field.onChange(val === "true")}
                                value={field.value ? "true" : "false"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Activo</SelectItem>
                                    <SelectItem value="false">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">
                        {isActive ? "Acceso permitido" : "Acceso denegado"}
                    </span>
                </Field>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        if (redirectUrl) router.push(redirectUrl);
                        else router.back();
                    }}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Guardar Cambios" : "Enviar Invitación"}
                </Button>
            </div>
        </form>
    );
}
