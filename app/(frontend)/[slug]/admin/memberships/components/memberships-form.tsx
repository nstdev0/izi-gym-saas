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
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MembershipStatus } from "@/server/domain/entities/Membership";
import { MemberCombobox } from "./member-combobox";
import { createMembershipSchema } from "@/server/application/dtos/memberships.dto";
import { Member } from "@/server/domain/entities/Member";
import { Plan } from "@/server/domain/entities/Plan";

export interface SelectablePlan {
    id: string;
    name: string;
    price: number;
    durationDays: number;
}

interface MembershipFormProps {
    initialData?: {
        id: string;
        memberId: string;
        planId: string;
        startDate: Date | string; // Flexibilidad por si viene string o date
        endDate: Date | string;
        pricePaid: number;
        status: string;
        member?: Member;
    };
    isEdit?: boolean;
    redirectUrl: string;
    plans: SelectablePlan[];
}

export default function MembershipForm({
    initialData,
    isEdit = false,
    redirectUrl,
    plans,
}: MembershipFormProps) {
    const router = useRouter();

    const initialMember = initialData?.member ? initialData.member : undefined;

    const form = useForm<z.infer<typeof createMembershipSchema>>({
        resolver: zodResolver(createMembershipSchema),
        defaultValues: {
            memberId: initialData?.memberId || "",
            planId: initialData?.planId || "",
            startDate: initialData?.startDate
                ? new Date(initialData.startDate)
                : new Date(),
            endDate: initialData?.endDate
                ? new Date(initialData.endDate)
                : new Date(),
            pricePaid: initialData?.pricePaid || 0,
            status: (initialData?.status as MembershipStatus) || MembershipStatus.PENDING,
        },
    });

    const selectedPlanId = form.watch("planId");
    const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

    // Actualiza solo el precio, no el ID (el ID ya lo maneja el field.onChange)
    const updatePriceFromPlan = (planId: string) => {
        const plan = plans?.find((p) => p.id === planId);
        if (plan && !isEdit) {
            form.setValue("pricePaid", plan.price);
        }
    };

    const { mutate: mutateMembership, isPending } = useMutation({
        mutationFn: async (values: z.infer<typeof createMembershipSchema>) => {
            const plan = plans?.find((p) => p.id === values.planId);

            // CORRECCIÓN FECHAS: Normalizar a inicio del día (00:00:00 local) para evitar saltos de día por UTC
            const startDate = new Date(values.startDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);

            // Calcular fecha fin basada en la duración del plan
            if (plan) {
                // endDate = startDate + durationDays
                endDate.setDate(startDate.getDate() + plan.durationDays);
                // Ajustar al final del día si se prefiere (23:59:59), o mantener consistencia de fecha
                endDate.setHours(23, 59, 59, 999);
            } else {
                // Fallback si no hay plan (ej: edición manual sin cambiar plan), usar la fecha del form
                const formEndDate = new Date(values.endDate);
                formEndDate.setHours(23, 59, 59, 999);
                endDate.setTime(formEndDate.getTime());
            }

            const payload = {
                ...values,
                startDate: startDate,
                endDate: endDate,
            };

            if (isEdit && initialData?.id) {
                return api.patch(`/api/memberships/${initialData.id}`, payload);
            }
            return api.post("/api/memberships", payload);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Membresía actualizada" : "Membresía creada");
            router.refresh();
            router.push(redirectUrl);
        },
        onError: (error) => {
            if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
                Object.entries(error.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof z.infer<typeof createMembershipSchema>, {
                        type: "server",
                        message: messages[0],
                    }, { shouldFocus: true });
                });
                toast.error("Revisa los errores marcados.");
            } else {
                toast.error(error.message || "Error al guardar");
            }
        },
    });

    return (
        <form onSubmit={form.handleSubmit((data) => mutateMembership(data))} className="space-y-8">
            <Card>
                <CardHeader><CardTitle>Información de la Membresía</CardTitle></CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">

                    {/* MIEMBRO */}
                    <Controller
                        name="memberId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Miembro</FieldLabel>
                                <MemberCombobox
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isEdit}
                                    initialMember={initialMember}
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* PLAN - TRUNCATE CORREGIDO */}
                    <Controller
                        name="planId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Plan</FieldLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val); // 1. Registrar cambio
                                        updatePriceFromPlan(val); // 2. Actualizar precio
                                    }}
                                    value={field.value}
                                >
                                    <SelectTrigger aria-invalid={fieldState.invalid} className="w-full">
                                        {/* SOLUCIÓN TRUNCATE: 
                                            Usamos 'span' con 'block' y 'truncate'. 
                                            Esto suele comportarse mejor dentro de botones que un div flex.
                                        */}
                                        <span className="block truncate text-left w-full">
                                            <SelectValue placeholder="Selecciona un plan" />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans?.map((plan) => (
                                            <SelectItem
                                                key={plan.id}
                                                value={plan.id}
                                                className="whitespace-normal wrap-break-word" // Permitir multilínea en el menú
                                            >
                                                {plan.name} - S/ {plan.price} ({plan.durationDays} días)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* FECHA INICIO - CORREGIDO */}
                    <Controller
                        name="startDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Fecha de Inicio</FieldLabel>
                                <Input
                                    type="date"
                                    {...field}
                                    // z.coerce.date() maneja la conversión de string a Date
                                    value={field.value instanceof Date
                                        ? field.value.toISOString().split("T")[0]
                                        : (field.value ? String(field.value) : "")}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* PRECIO PAGADO */}
                    <Controller
                        name="pricePaid"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Precio Pagado</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    {...field}
                                    value={field.value ?? ""}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="0.00"
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* ESTADO */}
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Estado</FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={MembershipStatus.PENDING}>Pendiente</SelectItem>
                                        <SelectItem value={MembershipStatus.ACTIVE}>Activa</SelectItem>
                                        <SelectItem value={MembershipStatus.EXPIRED}>Vencida</SelectItem>
                                        <SelectItem value={MembershipStatus.CANCELLED}>Cancelada</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {selectedPlan && (
                        <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg border border-border">
                            <p className="text-sm text-muted-foreground">
                                <strong>Plan seleccionado:</strong> {selectedPlan.name} -
                                Duración: {selectedPlan.durationDays} días
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEdit ? "Guardar Cambios" : "Crear Membresía"}
                </Button>
            </div>
        </form>
    );
}