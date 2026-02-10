"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product, ProductType } from "@/server/domain/entities/Product";
import { createProductSchema } from "@/server/application/dtos/products.dto";
import { useCreateProduct, useUpdateProduct } from "@/hooks/products/use-products";
import { useRouter } from "next/navigation";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Loader2, Save } from "lucide-react";

const formSchema = createProductSchema;

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductsFormProps {
    initialData?: Product | null;
    isEdit?: boolean;
    redirectUrl?: string;
}

export const ProductsForm: React.FC<ProductsFormProps> = ({
    initialData,
    isEdit = false,
    redirectUrl,
}) => {
    const router = useRouter();

    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

    const isPending = isCreating || isUpdating;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                description: initialData.description || "",
                sku: initialData.sku || "",
            }
            : {
                name: "",
                sku: "",
                description: "",
                price: 0,
                cost: 0,
                stock: 0,
                minStock: 5,
                type: ProductType.MERCH,
                isActive: true,
            },
    });

    const isDirty = form.formState.isDirty;
    const canSubmit = isEdit ? isDirty : true;

    const onSubmit = (data: ProductFormValues) => {
        const onSuccess = () => {
            router.refresh();
            if (redirectUrl) {
                // router.push(redirectUrl);
            }
        };

        if (initialData?.id && isEdit) {
            updateProduct(
                { id: initialData.id, data },
                { onSuccess }
            );
        } else {
            createProduct(data, { onSuccess });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Información del Producto</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel required>Nombre del Producto</FieldLabel>
                                    <Input
                                        disabled={isPending}
                                        placeholder="Ej. Proteína Whey"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="sku"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>SKU (Código)</FieldLabel>
                                    <Input
                                        disabled={isPending}
                                        placeholder="PROD-001"
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    <Controller
                        control={form.control}
                        name="description"
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Descripción</FieldLabel>
                                <Textarea
                                    disabled={isPending}
                                    placeholder="Descripción detallada del producto..."
                                    className="resize-none"
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Controller
                            control={form.control}
                            name="price"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel required>Precio</FieldLabel>
                                    <Input
                                        type="number"
                                        disabled={isPending}
                                        placeholder="0.00"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="stock"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel required>Stock Actual</FieldLabel>
                                    <Input
                                        type="number"
                                        disabled={isPending}
                                        placeholder="0"
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="minStock"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel required>Stock Mínimo</FieldLabel>
                                    <Input
                                        type="number"
                                        disabled={isPending}
                                        placeholder="5"
                                        {...field}
                                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <div className="text-[0.8rem] text-muted-foreground mt-1">Alerta si baja de este valor</div>
                                    {fieldState.invalid && fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            control={form.control}
                            name="type"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel required>Tipo de Producto</FieldLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectTrigger aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Seleccionar tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ProductType.CONSUMABLE}>Consumible</SelectItem>
                                            <SelectItem value={ProductType.GEAR}>Equipamiento</SelectItem>
                                            <SelectItem value={ProductType.MERCH}>Merch</SelectItem>
                                            <SelectItem value={ProductType.SERVICE}>Servicio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            control={form.control}
                            name="isActive"
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FieldLabel className="text-base">ACTIVO</FieldLabel>
                                            <div className="text-[0.8rem] text-muted-foreground">
                                                Disponible para venta/uso.
                                            </div>
                                        </div>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </div>
                                    {fieldState.invalid && fieldState.error && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button
                    disabled={isPending}
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                >
                    Cancelar
                </Button>
                <Button disabled={isPending || !canSubmit} type="submit">
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {isEdit ? "Guardar Cambios" : "Crear Producto"}
                </Button>
            </div>
        </form>
    );
};
