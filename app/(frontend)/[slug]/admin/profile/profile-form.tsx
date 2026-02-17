"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, User, Mail, Upload } from "lucide-react";
import { UpdateUserSchema, UpdateUserInput } from "@/shared/types/users.types";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { AvatarUploader } from "@/components/avatar-uploader";

interface ProfileFormProps {
    defaultValues: Partial<UpdateUserInput>;
    email: string; // Email is read-only usually
}

export function ProfileForm({ defaultValues, email }: ProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UpdateUserInput>({
        resolver: zodResolver(UpdateUserSchema),
        defaultValues: {
            firstName: defaultValues.firstName || "",
            lastName: defaultValues.lastName || "",
            image: defaultValues.image || "",
        },
    });

    async function onSubmit(data: UpdateUserInput) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Error al actualizar perfil");
            }

            toast.success("Perfil actualizado correctamente");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error desconocido");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-none shadow-md bg-card">
            <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Información Personal</CardTitle>
                        <CardDescription>
                            Actualiza tu foto y datos personales.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-6">
                        <AvatarUploader
                            value={form.watch("image") || ""}
                            onChange={(url) => form.setValue("image", url, { shouldDirty: true })}
                            fileNamePrefix="profile"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Nombre</FieldLabel>
                            <Input
                                placeholder="Tu nombre"
                                {...form.register("firstName")}
                            />
                            {form.formState.errors.firstName && (
                                <FieldError errors={[form.formState.errors.firstName]} />
                            )}
                        </Field>

                        <Field>
                            <FieldLabel>Apellido</FieldLabel>
                            <Input
                                placeholder="Tu apellido"
                                {...form.register("lastName")}
                            />
                            {form.formState.errors.lastName && (
                                <FieldError errors={[form.formState.errors.lastName]} />
                            )}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={email}
                                disabled
                                className="pl-9 bg-muted/50"
                            />
                        </div>
                        <FieldDescription>
                            El email no se puede cambiar. Contacta a soporte si es necesario.
                        </FieldDescription>
                    </Field>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
