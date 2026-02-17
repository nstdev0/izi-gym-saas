"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, CreditCard, CalendarDays, DollarSign, Activity, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MembershipStatus } from "@/shared/types/memberships.types";
import { MemberCombobox } from "./member-combobox";
import { Member } from "@/shared/types/members.types";
import { CreateMembershipInput, createMembershipSchema } from "@/shared/types/memberships.types";
import { useCreateMembership, useUpdateMembership } from "@/hooks/memberships/use-memberships";

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
        member?: Partial<Member>;
    };
    isEdit?: boolean;
    redirectUrl: string;
    plans: SelectablePlan[];
    member?: Partial<Member>;
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

    const form = useForm<CreateMembershipInput>({
        resolver: zodResolver(createMembershipSchema),
        defaultValues: {
            memberId: initialData?.memberId || "",
            planId: initialData?.planId || "",
            startDate: initialData?.startDate
                ? new Date(initialData.startDate)
                : new Date(),
            endDate: initialData?.endDate
                ? new Date(initialData.endDate)
                : undefined,
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
            form.setValue("endDate", new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000), { shouldDirty: true });
        }
    };

    const isDirty = form.formState.isDirty;
    const canSubmit = isEdit ? isDirty : true;

    const { mutate: createMembership, isPending: isCreating } = useCreateMembership()
    const { mutate: updateMembership, isPending: isUpdating } = useUpdateMembership()

    const onSubmit = (values: CreateMembershipInput) => {
        const onSuccess = () => {
            if (redirectUrl) router.push(redirectUrl)
        }

        if (isEdit && initialData?.id) {
            updateMembership({ id: initialData.id, data: values }, {
                onSuccess
            })
        } else {
            createMembership(values, { onSuccess })
        }
    }

    const onInvalid = () => {
        toast.error("Por favor, completa todos los campos requeridos.")
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
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
                                    initialMember={initialMember ? {
                                        id: initialMember.id!,
                                        firstName: initialMember.firstName!,
                                        lastName: initialMember.lastName!
                                    } : null}
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

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-end gap-4 sticky bottom-4 z-10">
                <Button type="submit" disabled={isCreating || isUpdating && !canSubmit} size="lg">
                    {isCreating || isUpdating ? (
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