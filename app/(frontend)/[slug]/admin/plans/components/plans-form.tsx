"use client";

import { Controller, useForm } from "react-hook-form";
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
import { Loader2, Save, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plan } from "@/shared/types/plans.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatePlanInput, createPlanSchema } from "@/shared/types/plans.types";
import { useCreatePlan, useUpdatePlan } from "@/hooks/plans/use-plans";

interface PlanFormProps {
    initialData?: Plan;
    isEdit?: boolean;
    redirectUrl?: string;
}

export default function PlanForm({
    initialData,
    isEdit = false,
    redirectUrl,
}: PlanFormProps) {
    const router = useRouter();

    const form = useForm<CreatePlanInput>({
        resolver: zodResolver(createPlanSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            price: initialData?.price || undefined,
            durationDays: initialData?.durationDays || 30,
            isActive: initialData?.isActive ?? true,
        },
    });

    const isDirty = form.formState.isDirty;
    const canSubmit = isEdit ? isDirty : true;

    const { mutate: createPlan, isPending: isCreating } = useCreatePlan()
    const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan()

    const isPending = isCreating || isUpdating;

    const onSubmit = (values: CreatePlanInput) => {
        const onSuccess = () => {
            if (redirectUrl) router.push(redirectUrl);
        }

        if (isEdit && initialData) {
            updatePlan({ id: initialData.id, data: values }, { onSuccess });
        } else {
            createPlan(values, { onSuccess });
        }
    }

    const onInvalid = () => {
        toast.error("Por favor completa los campos requeridos")

    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <Card className="border-none shadow-md border-l-4 border-l-blue-500 bg-linear-to-br from-card to-blue-500/5">
                <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-lg">Información del Plan</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Nombre del Plan</FieldLabel>
                                <Input
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Ej: Plan Mensual"
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="price"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Precio</FieldLabel>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="0"
                                    {...field}
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="durationDays"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Duración</FieldLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(parseInt(val))}
                                    defaultValue={field.value?.toString()}
                                >
                                    <SelectTrigger aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">1 semana</SelectItem>
                                        <SelectItem value="15">15 días</SelectItem>
                                        <SelectItem value="30">1 mes</SelectItem>
                                        <SelectItem value="60">2 meses</SelectItem>
                                        <SelectItem value="90">3 meses</SelectItem>
                                        <SelectItem value="180">6 meses</SelectItem>
                                        <SelectItem value="365">1 año</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="isActive"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel required>Estado</FieldLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(val === "true")}
                                    defaultValue={field.value?.toString()}
                                >
                                    <SelectTrigger aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Activo</SelectItem>
                                        <SelectItem value="false">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="md:col-span-2">
                                <FieldLabel>Descripción</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value || ""}
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Descripción del plan (opcional)"
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isPending || !canSubmit}>
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {isEdit ? "Guardar Cambios" : "Crear Plan"}
                </Button>
            </div>
        </form>
    );
}
