"use client";

import { UpdateAttendanceInput } from "@/shared/types/attendance.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, QrCode, Hand, CalendarDays, Loader2, Save, Clock, Calendar as CalendarIcon, UserCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUpdateAttendance } from "@/hooks/attendance/use-attendance";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Attendance } from "@/shared/types/attendance.types";

interface AttendanceFormProps {
    data: Attendance;
}

export function AttendanceForm({ data }: AttendanceFormProps) {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: updateAttendance, isPending: isUpdating } = useUpdateAttendance();

    // Editable state initialized from data
    const [date, setDate] = useState<Date>(new Date(data.date));
    const [method, setMethod] = useState<"QR" | "MANUAL">(data.method as "QR" | "MANUAL");

    // Track if there are unsaved changes
    const originalDate = new Date(data.date);
    const originalMethod = data.method;
    const hasChanges =
        date.getTime() !== originalDate.getTime() || method !== originalMethod;

    const handleSave = () => {
        const updateData: UpdateAttendanceInput = {};
        if (date.getTime() !== originalDate.getTime()) {
            updateData.date = date;
        }
        if (method !== originalMethod) {
            updateData.method = method;
        }
        updateAttendance({ id: data.id, data: updateData });
    };

    const member = data.member;

    return (
        <div className="grid grid-cols-1 gap-6">

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
                            </div>
                        </div>
                        <Link href={`/${slug}/admin/members/${member?.id}`}>
                            <Button variant="ghost" className="group text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Ver Perfil <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
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
                        <div className="space-y-3">
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
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                                        {date ? (
                                            <span className="font-medium">
                                                {format(date, "PPP p", { locale: es })}
                                            </span>
                                        ) : (
                                            <span>Seleccionar fecha</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        autoFocus
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Method Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <QrCode className="w-3.5 h-3.5" />
                                Método de Ingreso
                            </label>
                            <Select value={method} onValueChange={(val) => setMethod(val as "QR" | "MANUAL")}>
                                <SelectTrigger className="h-11 bg-background/50 border-input/60 hover:border-orange-500/50 shadow-sm">
                                    <SelectValue />
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
                        </div>
                    </div>

                    <Separator className="my-2 bg-border/50" />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-muted-foreground">
                            Registro original creado el: <span className="font-mono font-medium text-foreground">{format(new Date(data.createdAt), "dd/MM/yyyy HH:mm")}</span>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || isUpdating}
                            size="lg"
                            className={cn(
                                "w-full sm:w-auto shadow-md transition-all duration-300",
                                hasChanges ? "animate-in zoom-in-95 bg-orange-600 hover:bg-orange-700 text-white" : "opacity-80"
                            )}
                        >
                            {isUpdating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Guardar Cambios
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}