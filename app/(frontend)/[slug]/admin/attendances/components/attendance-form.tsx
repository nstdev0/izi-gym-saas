"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateAttendanceInput, UpdateAttendanceSchema, AttendanceResponse } from "@/shared/types/attendance.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Hand, CalendarDays, Loader2, Save, Clock, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUpdateAttendance } from "@/hooks/attendance/use-attendance";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";

interface AttendanceFormProps {
    initialData?: AttendanceResponse;
    redirectUrl?: string;
}

export function AttendanceForm({ initialData, redirectUrl }: AttendanceFormProps) {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { mutate: updateAttendance, isPending: isUpdating } = useUpdateAttendance();

    const form = useForm<UpdateAttendanceInput>({
        resolver: zodResolver(UpdateAttendanceSchema),
        defaultValues: {
            date: initialData?.date ? new Date(initialData.date) : new Date(),
            method: (initialData?.method || "QR") as "QR" | "MANUAL",
        },
    });

    const isDirty = form.formState.isDirty;

    const onSubmit = (values: UpdateAttendanceInput) => {
        if (!initialData?.id) return;
        updateAttendance(
            { id: initialData.id, data: values },
            {
                onSuccess: () => {
                    if (redirectUrl) {
                        router.push(redirectUrl);
                    }
                }
            }
        );
    };

    const onInvalid = () => {
        toast.error("Por favor completa los campos requeridos.");
    };

    const member = initialData?.member;

    return (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="grid grid-cols-1 gap-6">

            {/* MEMBER INFO CARD */}
            <Card className="border-none shadow-md border-l-4 border-l-blue-500 bg-linear-to-br from-card to-blue-500/5 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-sm ring-2 ring-blue-100">
                                <AvatarImage src={member?.image || undefined} alt={member?.firstName || ""} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                                    {member?.firstName.charAt(0)}{member?.lastName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    {member?.firstName} {member?.lastName}
                                    <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                                        MIEMBRO
                                    </Badge>
                                </h3>
                                <p className="text-sm text-muted-foreground break-all">
                                    {member?.email}
                                </p>
                            </div>
                        </div>
                        {member?.id && (
                            <Link href={`/${slug}/admin/members/${member.id}`}>
                                <Button type="button" variant="ghost" className="group text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    Ver Perfil <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ATTENDANCE DETAILS EDITOR */}
            <Card className="border-none shadow-md border-l-4 border-l-orange-500 bg-linear-to-br from-card to-orange-500/5">
                <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <CardTitle className="text-lg">Editar Asistencia</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Date Picker */}
                        <Controller
                            name="date"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-3">
                                    <Field data-invalid={fieldState.invalid}>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <CalendarDays className="w-3.5 h-3.5" />
                                            Fecha y Hora
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal h-11 bg-background/50 hover:bg-background border-input/60 hover:border-orange-500/50 transition-colors shadow-sm",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    aria-invalid={fieldState.invalid}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                                                    {field.value ? (
                                                        <span className="font-medium">{format(field.value, "PPP p", { locale: es })}</span>
                                                    ) : (
                                                        <span>Seleccionar fecha</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    autoFocus
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(d) => d && field.onChange(d)}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                </div>
                            )}
                        />

                        {/* Method Selector */}
                        <Controller
                            name="method"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <div className="space-y-3">
                                    <Field data-invalid={fieldState.invalid}>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <QrCode className="w-3.5 h-3.5" />
                                            Método de Ingreso
                                        </label>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger aria-invalid={fieldState.invalid} className="h-11 bg-background/50 border-input/60 hover:border-orange-500/50 shadow-sm">
                                                <SelectValue placeholder="Selecciona el método" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MANUAL">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-blue-100 rounded text-blue-600">
                                                            <Hand className="w-3 h-3" />
                                                        </div>
                                                        <span className="font-medium">Registro Manual</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="QR">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 bg-emerald-100 rounded text-emerald-600">
                                                            <QrCode className="w-3 h-3" />
                                                        </div>
                                                        <span className="font-medium">Escaneo QR</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && fieldState.error && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                </div>
                            )}
                        />
                    </div>

                    <Separator className="my-2 bg-border/50" />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-muted-foreground">
                            {initialData?.createdAt && (
                                <>
                                    Registro original creado el: <span className="font-mono font-medium text-foreground">{format(new Date(initialData.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                </>
                            )}
                        </div>

                        {/* BOTON DE ACCIÓN */}
                        <div className="flex justify-end gap-4 sticky bottom-4 z-10">
                            <Button type="submit" disabled={isUpdating || !isDirty} size="lg">
                                {isUpdating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}