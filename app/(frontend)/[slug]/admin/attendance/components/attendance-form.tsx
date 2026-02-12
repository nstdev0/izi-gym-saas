"use client";

import { AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, QrCode, Hand, CalendarDays, Loader2, Save } from "lucide-react";
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

interface AttendanceFormProps {
    data: AttendanceWithMember;
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
        <div className="space-y-6">
            {/* Member Info Card (read-only) */}
            <Card>
                <CardHeader>
                    <CardTitle>Miembro</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link
                        href={`/${slug}/admin/members/${member.id}`}
                        className="flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {member.image ? (
                                <Image
                                    src={member.image}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    width={48}
                                    height={48}
                                    className="rounded-full"
                                />
                            ) : (
                                <Users className="w-6 h-6 text-primary" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-lg group-hover:underline">
                                {member.firstName} {member.lastName}
                            </p>
                        </div>
                    </Link>
                </CardContent>
            </Card>

            {/* Editable Attendance Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalles de Asistencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date Picker */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha y Hora</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP p", { locale: es }) : <span>Seleccionar fecha</span>}
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Método</label>
                            <Select value={method} onValueChange={(val) => setMethod(val as "QR" | "MANUAL")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MANUAL">
                                        <div className="flex items-center gap-2">
                                            <Hand className="w-3 h-3" />
                                            Manual
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="QR">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="w-3 h-3" />
                                            QR
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Created At (read-only) */}
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Registrado</p>
                            <span className="font-medium text-sm">
                                {new Date(data.createdAt).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={!hasChanges || isUpdating}>
                    {isUpdating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
