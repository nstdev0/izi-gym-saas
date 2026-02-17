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
import { Loader2, Save, User, Mail, Shield, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import { User as UserEntity } from "@/server/domain/entities/User";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { AvatarUploader } from "@/components/avatar-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateUser, useUpdateUser } from "@/hooks/users/use-users";

type UserFormProps = {
    initialData?: UserEntity;
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

    const { mutate: createUser, isPending: isCreating } = useCreateUser();
    const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

    const isPending = isCreating || isUpdating;

    const handleSuccess = () => {
        router.refresh();
        if (redirectUrl) {
            router.push(redirectUrl);
        }
    };

    const handleError = (error: Error) => {
        if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
            Object.entries(error.errors).forEach(([field, messages]) => {
                form.setError(field as keyof z.infer<typeof CreateUserSchema>, {
                    type: "server",
                    message: (messages as string[])[0],
                });
            });
        }
        // The hooks already show a toast on error, so we might not need to show another one here
        // or we can allow the hook to handle the generic error and we handle validation errors.
    };

    const onSubmit = (values: z.infer<typeof CreateUserSchema>) => {
        if (isEdit && initialData?.id) {
            updateUser(
                { id: initialData.id, data: values },
                {
                    onSuccess: handleSuccess,
                    onError: handleError,
                }
            );
        } else {
            createUser(values, {
                onSuccess: handleSuccess,
                onError: handleError,
            });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
            {!isEdit && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 flex items-center gap-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded-full">
                        <Mail className="w-4 h-4" />
                    </div>
                    <span>
                        Se enviará una invitación por correo. El usuario podrá elegir iniciar sesión con <strong>Google</strong> o crear una contraseña.
                    </span>
                </div>
            )}

            <Card className="border-none shadow-md border-l-4 border-l-blue-500 bg-linear-to-br from-card to-blue-500/5">
                <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg">Información del Usuario</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 grid gap-8 md:grid-cols-[200px_1fr]">
                    <div className="flex flex-col items-center gap-4">
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
                        <p className="text-xs text-muted-foreground text-center">
                            Sube una foto de perfil para identificar al usuario.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombres (Opcional, pero útil para la invitación) */}
                        <Field>
                            <FieldLabel>Nombre (Opcional)</FieldLabel>
                            <Input
                                placeholder="Juan"
                                {...form.register("firstName")}
                                className="bg-background/50"
                            />
                            <FieldError errors={[form.formState.errors.firstName]} />
                        </Field>

                        <Field>
                            <FieldLabel>Apellido (Opcional)</FieldLabel>
                            <Input
                                placeholder="Pérez"
                                {...form.register("lastName")}
                                className="bg-background/50"
                            />
                            <FieldError errors={[form.formState.errors.lastName]} />
                        </Field>

                        {/* Email */}
                        <Field className="md:col-span-2">
                            <FieldLabel required>Email</FieldLabel>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="usuario@ejemplo.com"
                                    {...form.register("email")}
                                    disabled={isEdit}
                                    className="pl-9 bg-background/50"
                                />
                            </div>
                            <FieldError errors={[form.formState.errors.email]} />
                        </Field>

                        {/* Role */}
                        <Field>
                            <FieldLabel required className="flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" /> Rol de Acceso
                            </FieldLabel>
                            <Controller
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="bg-background/50">
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
                            <FieldLabel className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5" /> Estado
                            </FieldLabel>
                            <Controller
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(val === "true")}
                                        value={field.value ? "true" : "false"}
                                    >
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue placeholder="Estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Activo</SelectItem>
                                            <SelectItem value="false">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                                {isActive ? "El usuario puede acceder al sistema." : "El acceso del usuario está revocado."}
                            </span>
                        </Field>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
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
                <Button type="submit" disabled={isPending} className="shadow-lg hover:shadow-xl transition-all">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Guardar Cambios" : "Enviar Invitación"}
                </Button>
            </div>
        </form>
    );
}
