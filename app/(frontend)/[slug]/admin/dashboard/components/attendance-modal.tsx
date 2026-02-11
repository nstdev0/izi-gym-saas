"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, StopCircle, Calendar as CalendarIcon, Loader2, QrCode, Keyboard } from "lucide-react";
import { MemberCombobox } from "../../memberships/components/member-combobox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { AttendanceService } from "@/lib/services/attendance.service";
import { useQueryClient } from "@tanstack/react-query";
import { useMemberByQrCode } from "@/hooks/members/use-members";
import { Badge } from "@/components/ui/badge";

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
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Registrar Asistencia</DialogTitle>
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

    // ✅ NUEVO ESTADO: Controla el método de ingreso
    const [attendanceMethod, setAttendanceMethod] = useState<"QR" | "MANUAL">("MANUAL");

    // Inicializamos como null para que el hook no se dispare al montar
    const [scannedQr, setScannedQr] = useState<string | null>(null);
    const [date, setDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const queryClient = useQueryClient();

    // Hook: Busca el miembro cuando scannedQr cambia
    const { data: memberFoundByQr, isLoading: isSearchingMember } = useMemberByQrCode(scannedQr || "");

    // EFECTO: Cuando el QR encuentra a alguien
    useEffect(() => {
        if (memberFoundByQr) {
            setSelectedMemberId(memberFoundByQr.id);

            // ✅ CAMBIO CLAVE: Marcamos que fue por QR
            setAttendanceMethod("QR");

            toast.success(`Miembro identificado: ${memberFoundByQr.firstName} ${memberFoundByQr.lastName}`);
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
            try { if (scannerRef.current.isScanning) await scannerRef.current.stop(); scannerRef.current.clear(); } catch (e) { }
            scannerRef.current = null;
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        try { new Audio(BEEP_AUDIO).play().catch(() => { }); } catch (e) { }
        setScannedQr(decodedText);
    };

    const handleRegister = async () => {
        if (!selectedMemberId) return;
        setIsLoading(true);
        try {
            await AttendanceService.register({
                memberId: selectedMemberId,
                date: date,
                method: attendanceMethod // ✅ ENVIAMOS EL MÉTODO CORRECTO
            });

            toast.success("Asistencia registrada correctamente");
            queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
            queryClient.invalidateQueries({ queryKey: ["attendances"] });
            onClose();

        } catch (error) {
            console.error(error);
            toast.error("Error al registrar asistencia");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Zona del Escáner */}
            <div className="flex flex-col items-center gap-3 w-full">
                {isScanning ? (
                    <div className="w-full relative bg-black rounded-lg overflow-hidden shadow-inner">
                        <div id="reader" className="w-full h-[300px]"></div>
                        {isSearchingMember && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                                <Loader2 className="h-10 w-10 animate-spin text-white" />
                                <span className="text-white ml-2 font-medium">Identificando...</span>
                            </div>
                        )}
                        <Button
                            size="sm"
                            variant="destructive"
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 shadow-lg"
                            onClick={() => {
                                setIsScanning(false);
                                setScannedQr(null);
                            }}
                        >
                            <StopCircle className="mr-2 h-4 w-4" />
                            Detener Cámara
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full h-12 border-dashed border-2"
                        onClick={() => setIsScanning(true)}
                    >
                        <Camera className="mr-2 h-5 w-5" />
                        Escanear Código QR
                    </Button>
                )}
            </div>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Detalles de Asistencia
                    </span>
                </div>
            </div>

            {/* Formulario Manual */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Miembro</label>
                        {/* Indicador Visual del Método */}
                        <Badge variant={attendanceMethod === "QR" ? "default" : "secondary"} className="text-[10px] h-5">
                            {attendanceMethod === "QR" ? (
                                <><QrCode className="w-3 h-3 mr-1" /> QR DETECTADO</>
                            ) : (
                                <><Keyboard className="w-3 h-3 mr-1" /> MANUAL</>
                            )}
                        </Badge>
                    </div>

                    <MemberCombobox
                        value={selectedMemberId}
                        onChange={(val) => {
                            setSelectedMemberId(val);
                            setAttendanceMethod("MANUAL");
                            if (isScanning) setIsScanning(false);
                        }}
                        placeholder="Buscar por nombre o DNI..."
                        foundMember={memberFoundByQr}
                    />
                </div>

                <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-medium">Fecha y Hora</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
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

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleRegister} disabled={!selectedMemberId || isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmar
                </Button>
            </div>
        </div>
    );
}