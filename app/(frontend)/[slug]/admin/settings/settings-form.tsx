"use client";

import { useForm, FormProvider, Controller, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Building, Settings2, Bell, CreditCard, Calendar, ShieldCheck, Palette, Users } from "lucide-react";
import { UpdateOrganizationSettingsInput, UpdateOrganizationSettingsSchema } from "@/server/application/dtos/organizations.dto";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUploader } from "@/components/avatar-uploader";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateOrganization } from "@/hooks/organizations/use-organizations";

interface SettingsFormProps {
    id: string;
    defaultValues: Partial<UpdateOrganizationSettingsInput>;
}

export function SettingsForm({ id, defaultValues }: SettingsFormProps) {
    const form = useForm<UpdateOrganizationSettingsInput>({
        resolver: zodResolver(UpdateOrganizationSettingsSchema),
        defaultValues,
    });

    const { mutate: updateOrganization, isPending: isLoading } = useUpdateOrganization()

    const onSubmit = (values: UpdateOrganizationSettingsInput) => {
        const onSuccess = () => {
        };

        updateOrganization({ id, data: values }, { onSuccess });
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="identity" className="w-full">
                    <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6 justify-start w-full">
                        <TabTrigger value="identity" icon={Building}>Identidad</TabTrigger>
                        <TabTrigger value="branding" icon={Palette}>Marca</TabTrigger>
                        {/* <TabTrigger value="operations" icon={Settings2}>Operaciones</TabTrigger> */}
                        <TabTrigger value="billing" icon={CreditCard}>Facturación</TabTrigger>
                        <TabTrigger value="booking" icon={Calendar}>Reservas</TabTrigger>
                        <TabTrigger value="access" icon={ShieldCheck}>Acceso</TabTrigger>
                        <TabTrigger value="notifications" icon={Bell}>Alertas</TabTrigger>
                        <TabTrigger value="advanced" icon={Users}>Avanzado</TabTrigger>
                    </TabsList>

                    <TabsContent value="identity" className="mt-0">
                        <IdentityTab />
                    </TabsContent>

                    <TabsContent value="branding" className="mt-0">
                        <BrandingTab />
                    </TabsContent>

                    {/* <TabsContent value="operations" className="mt-0">
                        <OperationsTab />
                    </TabsContent> */}

                    <TabsContent value="billing" className="mt-0">
                        <BillingTab />
                    </TabsContent>

                    <TabsContent value="booking" className="mt-0">
                        <BookingTab />
                    </TabsContent>

                    <TabsContent value="access" className="mt-0">
                        <AccessControlTab />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0">
                        <NotificationsTab />
                    </TabsContent>

                    <TabsContent value="advanced" className="mt-0">
                        <AdvancedTab />
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end sticky bottom-4">
                    <Button type="submit" disabled={isLoading} size="lg" className="shadow-lg">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}

function TabTrigger({ value, icon: Icon, children }: { value: string, icon: any, children: React.ReactNode }) {
    return (
        <TabsTrigger
            value={value}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2 items-center px-4 py-2 rounded-full border bg-card hover:bg-muted transition-all"
        >
            <Icon className="w-4 h-4" />
            {children}
        </TabsTrigger>
    )
}


function IdentityTab() {
    const { control } = useFormContext<UpdateOrganizationSettingsInput>();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Identidad & General</CardTitle>
                <CardDescription>Información básica de la organización.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Nombre de Organización</FieldLabel>
                            <Input placeholder="Mi Gimnasio" {...field} />
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="config.identity.website"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Sitio Web</FieldLabel>
                            <Input placeholder="https://..." {...field} value={field.value || ""} />
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="config.identity.contact_email"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Email de Contacto</FieldLabel>
                            <Input placeholder="contacto@gym.com" {...field} value={field.value || ""} />
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="config.identity.currency"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Moneda</FieldLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "PEN"}>
                                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PEN">S/ (PEN)</SelectItem>
                                    <SelectItem value="USD">$ (USD)</SelectItem>
                                    <SelectItem value="EUR">€ (EUR)</SelectItem>
                                    <SelectItem value="MXN">$ (MXN)</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="config.identity.timezone"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Zona Horaria</FieldLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "America/Lima"}>
                                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="America/Lima">Lima / Bogotá (GMT-5)</SelectItem>
                                    <SelectItem value="America/Santiago">Santiago (GMT-4)</SelectItem>
                                    <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                                    <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                />
            </CardContent>
        </Card>
    )
}

function BrandingTab() {
    const { control, setValue, watch } = useFormContext<UpdateOrganizationSettingsInput>();
    const logoUrl = watch("image");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Marca & Apariencia</CardTitle>
                <CardDescription>Personaliza cómo ven tus clientes la plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20">
                    <FieldLabel className="mb-4">Logo de la Organización</FieldLabel>
                    <AvatarUploader
                        value={logoUrl || ""}
                        onChange={(url) => setValue("image", url, { shouldDirty: true })}
                        fileNamePrefix="org-logo"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                    <Controller
                        control={control}
                        name="config.branding.app_name_override"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Nombre App Personalizado</FieldLabel>
                                <Input placeholder="Tu App Fitness" {...field} value={field.value || ""} />
                            </Field>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

function getContrastColor(hexColor: string) {
    // If invalid hex, default to black text
    if (!hexColor || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexColor)) return "#000000";

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (hexColor.length === 4) {
        hexColor = "#" + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
    }

    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Calculate distinctness
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? "#000000" : "#ffffff";
}

// function OperationsTab() {
//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Operación Diario</CardTitle>
//             </CardHeader>
//             <div className="p-6 text-center text-muted-foreground">Coming soon...</div>
//         </Card>
//     )
// }

function BillingTab() {
    const { control } = useFormContext<UpdateOrganizationSettingsInput>();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Facturación & Impuestos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        control={control}
                        name="config.billing.tax_settings.enabled"
                        render={({ field }) => (
                            <SwitchField label="Habilitar Impuestos" description="Calcular impuestos en ventas" field={field} />
                        )}
                    />
                    <Controller
                        control={control}
                        name="config.billing.payment_gateways.cash.enabled"
                        render={({ field }) => (
                            <SwitchField label="Pago en Efectivo" description="Permitir registrar pagos en caja" field={field} />
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        control={control}
                        name="config.billing.tax_settings.tax_name"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Nombre Impuesto (ej. IGV)</FieldLabel>
                                <Input {...field} value={field.value || "IGV"} />
                            </Field>
                        )}
                    />
                    <Controller
                        control={control}
                        name="config.billing.tax_settings.tax_rate"
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Tasa Impuesto (0.18 = 18%)</FieldLabel>
                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} value={field.value} />
                            </Field>
                        )}
                    />
                </div>

            </CardContent>
        </Card>
    )
}

function BookingTab() {
    const { control } = useFormContext<UpdateOrganizationSettingsInput>();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reglas de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <Controller
                    control={control}
                    name="config.booking.booking_window_days"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Ventana de Reserva (Días)</FieldLabel>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} value={field.value} />
                            <FieldDescription>Con cuánta anticipación se puede reservar.</FieldDescription>
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="config.booking.max_active_bookings"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Máx. Reservas Activas</FieldLabel>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} value={field.value} />
                        </Field>
                    )}
                />
                <Controller
                    control={control}
                    name="config.booking.waitlist.enabled"
                    render={({ field }) => (
                        <SwitchField label="Habilitar Lista de Espera" field={field} />
                    )}
                />
                <Controller
                    control={control}
                    name="config.booking.guest_passes_allowed"
                    render={({ field }) => (
                        <SwitchField label="Pases de Invitado" field={field} />
                    )}
                />
            </CardContent>
        </Card>
    )
}

function AccessControlTab() {
    const { control } = useFormContext<UpdateOrganizationSettingsInput>();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Control de Acceso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Controller
                    control={control}
                    name="config.accessControl.anti_passback"
                    render={({ field }) => (
                        <SwitchField label="Anti-Passback" description="Evitar doble entrada sin salida" field={field} />
                    )}
                />
                <Controller
                    control={control}
                    name="config.accessControl.multi_location_access"
                    render={({ field }) => (
                        <SwitchField label="Acceso Multisede" field={field} />
                    )}
                />
            </CardContent>
        </Card>
    )
}

function NotificationsTab() {
    const { control } = useFormContext<UpdateOrganizationSettingsInput>();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Controller
                    control={control}
                    name="config.notifications.channels.email"
                    render={({ field }) => (
                        <SwitchField label="Email" field={field} />
                    )}
                />
                <Controller
                    control={control}
                    name="config.notifications.triggers.payment_failed.enabled"
                    render={({ field }) => (
                        <SwitchField label="Alerta Pago Fallido" field={field} />
                    )}
                />
                <Controller
                    control={control}
                    name="config.notifications.triggers.membership_expiring.enabled"
                    render={({ field }) => (
                        <SwitchField label="Aviso Vencimiento Membresía" field={field} />
                    )}
                />
                <Controller
                    control={control}
                    name="config.notifications.triggers.membership_expiring.days_before"
                    render={({ field }) => (
                        <Field>
                            <FieldLabel>Días antes de vencer</FieldLabel>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} value={field.value} />
                        </Field>
                    )}
                />
            </CardContent>
        </Card>
    )
}

function AdvancedTab() {
    const { control } = useFormContext<UpdateOrganizationSettingsInput>();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Avanzado & Staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Controller
                    control={control}
                    name="config.features.gamification.leaderboards"
                    render={({ field }) => (
                        <SwitchField label="Gamificación: Leaderboards" field={field} />
                    )}
                />
                <Controller
                    control={control}
                    name="config.features.ecommerce.sell_products"
                    render={({ field }) => (
                        <SwitchField label="E-commerce: Venta Productos" field={field} />
                    )}
                />
                <Controller
                    control={control}
                    name="config.staffSettings.require_2fa"
                    render={({ field }) => (
                        <SwitchField label="Staff: Requerir 2FA" field={field} />
                    )}
                />
            </CardContent>
        </Card>
    )
}

function SwitchField({ label, description, field }: { label: string, description?: string, field: any }) {
    return (
        <Field orientation="horizontal" className="justify-between rounded-lg border p-4 items-center">
            <div className="space-y-0.5">
                <FieldLabel className="text-base">{label}</FieldLabel>
                {description && <FieldDescription>{description}</FieldDescription>}
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
        </Field>
    )
}
