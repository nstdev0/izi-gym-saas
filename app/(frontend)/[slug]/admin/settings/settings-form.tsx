"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { UpdateOrganizationSettingsInput, UpdateOrganizationSettingsSchema } from "@/server/application/dtos/organizations.dto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

interface SettingsFormProps {
    defaultValues: Partial<UpdateOrganizationSettingsInput>;
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UpdateOrganizationSettingsInput>({
        resolver: zodResolver(UpdateOrganizationSettingsSchema),
        defaultValues: {
            name: defaultValues.name || "",
            image: defaultValues.image || "",
            settings: {
                general: {
                    currency: defaultValues.settings?.general?.currency || "PEN",
                },
                operations: {
                    gracePeriodDays: defaultValues.settings?.operations?.gracePeriodDays ?? 5,
                    maxCapacity: defaultValues.settings?.operations?.maxCapacity ?? 100,
                    requireCheckInApproval: defaultValues.settings?.operations?.requireCheckInApproval ?? false,
                },
                notifications: {
                    emailAlerts: defaultValues.settings?.notifications?.emailAlerts ?? true,
                    smsAlerts: defaultValues.settings?.notifications?.smsAlerts ?? false,
                },
            },
        },
    });

    async function onSubmit(data: UpdateOrganizationSettingsInput) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update settings");
            }

            toast.success("Configuración actualizada correctamente");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar la configuración");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="operations">Operaciones</TabsTrigger>
                        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    </TabsList>

                    {/* GENERAL TAB */}
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                                <CardDescription>
                                    Configura los detalles básicos de tu organización.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Controller
                                    control={form.control}
                                    name="name"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>
                                                Nombre de la Organización
                                            </FieldLabel>
                                            <Input placeholder="Mi Gimnasio" {...field} />
                                            {fieldState.invalid && fieldState.error?.message && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                                <Controller
                                    control={form.control}
                                    name="settings.general.currency"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Moneda Principal</FieldLabel>
                                            <Input placeholder="PEN" {...field} />
                                            <FieldDescription>
                                                Código de moneda ISO (ej. PEN, USD).
                                            </FieldDescription>
                                            {fieldState.invalid && fieldState.error?.message && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* OPERATIONS TAB */}
                    <TabsContent value="operations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Operaciones</CardTitle>
                                <CardDescription>
                                    Ajusta las reglas operativas de tu gimnasio.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Controller
                                        control={form.control}
                                        name="settings.operations.gracePeriodDays"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Días de Gracia</FieldLabel>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                />
                                                <FieldDescription>
                                                    Días permitidos para ingresar después del vencimiento.
                                                </FieldDescription>
                                                {fieldState.invalid && fieldState.error?.message && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={form.control}
                                        name="settings.operations.maxCapacity"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Capacidad Máxima</FieldLabel>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                />
                                                <FieldDescription>
                                                    Aforo máximo permitido en el local.
                                                </FieldDescription>
                                                {fieldState.invalid && fieldState.error?.message && (
                                                    <FieldError errors={[fieldState.error]} />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>
                                <Controller
                                    control={form.control}
                                    name="settings.operations.requireCheckInApproval"
                                    render={({ field }) => (
                                        <Field orientation="horizontal" className="justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FieldLabel className="text-base">
                                                    Aprobar Check-ins
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Requiere aprobación manual de staff para cada ingreso.
                                                </FieldDescription>
                                            </div>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </Field>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NOTIFICATIONS TAB */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notificaciones</CardTitle>
                                <CardDescription>
                                    Gestiona las alertas automáticas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Controller
                                    control={form.control}
                                    name="settings.notifications.emailAlerts"
                                    render={({ field }) => (
                                        <Field orientation="horizontal" className="justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FieldLabel className="text-base">
                                                    Alertas por Email
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Enviar correos de vencimiento y confirmaciones.
                                                </FieldDescription>
                                            </div>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </Field>
                                    )}
                                />
                                <Controller
                                    control={form.control}
                                    name="settings.notifications.smsAlerts"
                                    render={({ field }) => (
                                        <Field orientation="horizontal" className="justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FieldLabel className="text-base">
                                                    Alertas SMS / WhatsApp
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Enviar mensajes al móvil del cliente.
                                                </FieldDescription>
                                            </div>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </Field>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
