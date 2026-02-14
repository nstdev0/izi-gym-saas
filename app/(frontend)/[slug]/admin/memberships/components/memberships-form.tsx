"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
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
import { Loader2, Save, CreditCard, CalendarDays, DollarSign, Activity, Info, ArrowLeft } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
        startDate: Date | string;
        endDate: Date | string;
        pricePaid: number;
        status: string;
        member?: Member;
    };
    isEdit?: boolean;
    redirectUrl: string;
    plans: SelectablePlan[];
    member?: Member;
}

export default function MembershipForm({
    initialData,
    isEdit = false,
    redirectUrl,
    plans,
    member,
}: MembershipFormProps) {
    const router = useRouter();
    const initialMember = member || (initialData?.member ? initialData.member : undefined);

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

    const selectedPlanId = useWatch({ control: form.control, name: "planId" });
    const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

    const updatePriceFromPlan = (planId: string) => {
        const plan = plans?.find((p) => p.id === planId);
        if (plan && !isEdit) {
            form.setValue("pricePaid", plan.price, { shouldDirty: true });
        }
    };

    const { mutate: mutateMembership, isPending } = useMutation({
        mutationFn: async (values: z.infer<typeof createMembershipSchema>) => {
            const plan = plans?.find((p) => p.id === values.planId);
            const startDate = new Date(values.startDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            if (plan) {
                endDate.setDate(startDate.getDate() + plan.durationDays);
                endDate.setHours(23, 59, 59, 999);
            } else {
                const formEndDate = new Date(values.endDate);
                formEndDate.setHours(23, 59, 59, 999);
                endDate.setTime(formEndDate.getTime());
            }

            const payload = { ...values, startDate, endDate };

            if (isEdit && initialData?.id) {
                return api.patch(`/api/memberships/${initialData.id}`, payload);
            }
            return api.post("/api/memberships", payload);
        },
        onSuccess: () => {
            toast.success(isEdit ? "Membresía actualizada correctamente" : "Membresía creada con éxito");
            router.refresh();
            router.push(redirectUrl);
        },
        onError: (error) => {
            if (error instanceof ApiError && error.code === "VALIDATION_ERROR" && error.errors) {
                Object.entries(error.errors).forEach(([field, messages]) => {
                    form.setError(field as any, { type: "server", message: messages[0] });
                });
                toast.error("Por favor, revisa los campos marcados.");
            } else {
                toast.error(error.message || "Ocurrió un error inesperado");
            }
        },
    });

    return (
        <form onSubmit={form.handleSubmit((data) => mutateMembership(data))} className="space-y-6">
            <Card className="border-none shadow-md border-l-4 border-l-purple-500 bg-linear-to-br from-card to-muted/20">
                <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <CardTitle className="text-lg">Configuración de Membresía</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 grid gap-8 md:grid-cols-2">

                    {/* MIEMBRO */}
                    <Controller
                        name="memberId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Miembro
                                </FieldLabel>

                                <MemberCombobox
                                    value={field.value}
                                    onChange={(val) => {
                                        field.onChange(val);
                                    }}
                                    disabled={isEdit}
                                    initialMember={initialMember}
                                    placeholder="Buscar por nombre o DNI..."
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    {/* PLAN */}
                    <Controller
                        name="planId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan Seleccionado</FieldLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        updatePriceFromPlan(val);
                                    }}
                                    value={field.value}
                                >
                                    <SelectTrigger aria-invalid={fieldState.invalid} className="h-14 bg-background/50 border-input/60 hover:border-purple-500/50 shadow-sm transition-all">
                                        <span className="block truncate text-left w-full">
                                            <SelectValue placeholder="Elige un plan de membresía" />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans?.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id} className="cursor-pointer">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{plan.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">S/ {plan.price} • {plan.durationDays} días</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* FECHA INICIO */}
                    <Controller
                        name="startDate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <CalendarDays className="w-3.5 h-3.5" /> Fecha de Inicio
                                </FieldLabel>
                                <Input
                                    type="date"
                                    {...field}
                                    value={field.value instanceof Date
                                        ? field.value.toISOString().split("T")[0]
                                        : (field.value ? String(field.value) : "")}
                                    className="h-11 bg-background/50 border-input/60 hover:border-purple-500/50 shadow-sm"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* PRECIO PAGADO */}
                    <Controller
                        name="pricePaid"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <DollarSign className="w-3.5 h-3.5" /> Monto Cobrado
                                </FieldLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">S/</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        {...field}
                                        className="h-11 pl-8 bg-background/50 border-input/60 hover:border-purple-500/50 shadow-sm font-semibold"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="0.00"
                                    />
                                </div>
                                {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* ESTADO */}
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> Estado de la Suscripción
                                </FieldLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger aria-invalid={fieldState.invalid} className="h-11 bg-background/50 border-input/60 hover:border-purple-500/50 shadow-sm">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={MembershipStatus.PENDING}>Pendiente</SelectItem>
                                        <SelectItem value={MembershipStatus.ACTIVE}>Activa</SelectItem>
                                        {isEdit && (
                                            <>
                                                <SelectItem value={MembershipStatus.EXPIRED}>Vencida</SelectItem>
                                                <SelectItem value={MembershipStatus.CANCELLED}>Cancelada</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    {/* RESUMEN DEL PLAN */}
                    {selectedPlan && (
                        <div className="md:col-span-2 p-4 bg-linear-to-r from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-full">
                                    <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                                        Detalles del Plan: {selectedPlan.name}
                                    </p>
                                    <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
                                        Esta membresía será válida por {selectedPlan.durationDays} días. El monto sugerido es S/ {selectedPlan.price}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ACCIONES */}
            <div className="flex items-center justify-end pt-4">
                <div className="flex gap-3">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="shadow-md shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 transition-all duration-300"
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEdit ? "Guardar Cambios" : "Confirmar Membresía"}
                    </Button>
                </div>
            </div>
        </form>
    );
}