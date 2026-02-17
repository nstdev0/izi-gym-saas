"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StopCircle, Calendar as CalendarIcon, Loader2, QrCode, Keyboard, ScanLine, X } from "lucide-react";
import { MemberCombobox } from "../../memberships/components/member-combobox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { attendanceKeys } from "@/lib/react-query/query-keys";
import { useMemberByQrCode } from "@/hooks/members/use-members";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { attendanceApi } from "@/lib/api-client/attendance.api";

const BEEP_AUDIO = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU";

// ----------------------------------------------------------------------
// COMPONENTE PADRE (WRAPPER)
// ----------------------------------------------------------------------
interface AttendanceModalProps {
    children: React.ReactNode;
}

export function AttendanceModal({ children }: AttendanceModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 border-none shadow-2xl bg-linear-to-b from-background to-muted/70" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className="px-6 py-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ScanLine className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-start">Registrar Asistencia</DialogTitle>
                            <DialogDescription className="text-xs">
                                Escanea un QR o busca manualmente
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                {open && <AttendanceForm onClose={() => setOpen(false)} />}
            </DialogContent>
        </Dialog>
    );
}

// ----------------------------------------------------------------------
// COMPONENTE HIJO (LÓGICA)
// ----------------------------------------------------------------------
interface AttendanceFormProps {
    onClose: () => void;
}

function AttendanceForm({ onClose }: AttendanceFormProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [attendanceMethod, setAttendanceMethod] = useState<"QR" | "MANUAL">("MANUAL");
    const [scannedQr, setScannedQr] = useState<string | null>(null);
    const [date, setDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const queryClient = useQueryClient();

    const { data: memberFoundByQr, isLoading: isSearchingMember } = useMemberByQrCode(scannedQr || "");

    // EFECTO: Cuando el QR encuentra a alguien
    useEffect(() => {
        if (memberFoundByQr) {
            setSelectedMemberId(memberFoundByQr.id);
            setAttendanceMethod("QR");
            toast.success(`Hola, ${memberFoundByQr.firstName}!`);
            setIsScanning(false);
            setScannedQr(null);
        }
    }, [memberFoundByQr]);

    // Limpieza
    useEffect(() => {
        return () => { cleanupScanner(); };
    }, []);

    // Lógica Scanner
    useEffect(() => {
        let isMounted = true;
        const initScanner = async () => {
            if (isScanning && !scannerRef.current) {
                await new Promise(r => setTimeout(r, 100));
                try {
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;
                    await html5QrCode.start(
                        { facingMode: "environment" },
                        { fps: 10, aspectRatio: 1.0 },
                        (decodedText) => { if (isMounted) handleScanSuccess(decodedText); },
                        () => { }
                    );
                } catch (err) {
                    console.error(err);
                    setIsScanning(false);
                }
            }
        };
        if (isScanning) initScanner();
        else cleanupScanner();
        return () => { isMounted = false; cleanupScanner(); };
    }, [isScanning]);

    const cleanupScanner = async () => {
        if (scannerRef.current) {
            try { if (scannerRef.current.isScanning) await scannerRef.current.stop(); scannerRef.current.clear(); } catch { }
            scannerRef.current = null;
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        try { new Audio(BEEP_AUDIO).play().catch(() => { }); } catch { }
        setScannedQr(decodedText);
    };

    const handleRegister = async () => {
        if (!selectedMemberId) return;
        setIsLoading(true);
        try {
            await attendanceApi.register({
                memberId: selectedMemberId,
                date: date,
                method: attendanceMethod
            });

            toast.success("Asistencia registrada correctamente");
            queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Error al registrar asistencia");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="p-6 space-y-6">

                {/* ZONA DEL ESCÁNER */}
                <div className="w-full transition-all duration-300 ease-in-out">
                    {isScanning ? (
                        <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden shadow-inner ring-1 ring-border">
                            <div id="reader" className="w-full h-full object-cover"></div>

                            {/* Overlay de Escaneo */}
                            <div className="absolute inset-0 border-30 border-black/60 pointer-events-none z-10">
                                <div className="w-full h-full border-2 border-primary/50 relative">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary"></div>
                                    {/* Scan Line Animation */}
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/50 animate-scan shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
                                </div>
                            </div>

                            {/* Loading State Overlay */}
                            {isSearchingMember && (
                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />
                                    <span className="text-foreground font-semibold text-lg">Identificando...</span>
                                </div>
                            )}

                            <Button
                                size="sm"
                                variant="destructive"
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 shadow-xl rounded-full px-6"
                                onClick={() => {
                                    setIsScanning(false);
                                    setScannedQr(null);
                                }}
                            >
                                <StopCircle className="mr-2 h-4 w-4" />
                                Detener
                            </Button>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsScanning(true)}
                            className="group relative w-full h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 hover:border-primary/50 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2"
                        >
                            <div className="p-3 bg-primary/5 rounded-full group-hover:bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                                <QrCode className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-semibold text-foreground block">Tocar para escanear QR</span>
                                <span className="text-xs text-muted-foreground">Activa la cámara de tu dispositivo</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative flex items-center py-2">
                    <Separator className="flex-1" />
                    <span className="mx-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">O ingreso manual</span>
                    <Separator className="flex-1" />
                </div>

                {/* FORMULARIO MANUAL */}
                <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Miembro</label>

                            {/* Visual Feedback de Método */}
                            {attendanceMethod === "QR" ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 gap-1.5 py-0.5">
                                    <QrCode className="w-3 h-3" />
                                    QR Detectado
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 gap-1.5 py-0.5">
                                    <Keyboard className="w-3 h-3" />
                                    Manual
                                </Badge>
                            )}
                        </div>

                        <MemberCombobox
                            value={selectedMemberId}
                            onChange={(val) => {
                                setSelectedMemberId(val);
                                setAttendanceMethod("MANUAL");
                                if (isScanning) setIsScanning(false);
                            }}
                            placeholder="Buscar por nombre..."
                            foundMember={memberFoundByQr}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha y Hora</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10 border-input bg-background hover:bg-accent hover:text-accent-foreground",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 bg-muted/30 border-t flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose} disabled={isLoading} className="hover:bg-muted/50">
                    Cancelar
                </Button>
                <Button onClick={handleRegister} disabled={!selectedMemberId || isLoading} className="shadow-md">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirmar Asistencia
                </Button>
            </div>
        </div>
    );
}