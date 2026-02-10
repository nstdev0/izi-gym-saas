"use client";

import { useState, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImg } from "@/lib/canvas-utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing-hooks";
import Image from "next/image";

interface AvatarUploaderProps {
    value?: string;
    onChange: (url: string) => void; // <--- AHORA DEVUELVE URL (STRING)
    disabled?: boolean;
    fileNamePrefix?: string; // <--- Nuevo: Para nombres personalizados
}

export function AvatarUploader({
    value,
    onChange,
    disabled,
    fileNamePrefix = "avatar"
}: AvatarUploaderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Hook de UploadThing
    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            console.log("UploadThing client complete:", res);
            if (res && res[0]) {
                // Con awaitServerData: false, usamos ufsUrl directamente
                const fileUrl = res[0].ufsUrl;
                console.log("File URL:", fileUrl);
                if (fileUrl) {
                    onChange(fileUrl);
                    toast.success("Foto subida correctamente");
                    setIsOpen(false);
                    setImageSrc(null);
                } else {
                    toast.error("No se pudo obtener la URL de la imagen");
                }
            }
        },
        onUploadError: (error) => {
            console.error("UploadThing error:", error);
            toast.error(`Error al subir: ${error.message}`);
            setIsOpen(false);
        },
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // MUCHO MÁS RÁPIDO Y LIGERO:
            const objectUrl = URL.createObjectURL(file);
            setImageSrc(objectUrl);
            setIsOpen(true);

            // Limpiar el input para permitir seleccionar el mismo archivo si falla
            e.target.value = "";
        }
    };

    const handleSaveCrop = async () => {
        try {
            if (!imageSrc || !croppedAreaPixels) return;

            // 1. Obtener Blob recortado
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            if (croppedBlob) {
                // 2. Generar nombre amigable: "juan-perez-17823.jpg"
                const cleanName = fileNamePrefix.toLowerCase().replace(/[^a-z0-9]/g, "-");
                const fileName = `${cleanName}-${Date.now()}.jpg`;

                // 3. Crear archivo
                const file = new File([croppedBlob], fileName, { type: "image/jpeg" });

                console.log("Starting upload for file:", fileName, "size:", file.size);

                // 4. Subir a la nube - usar el valor de retorno directamente
                const result = await startUpload([file]);

                console.log("Upload result:", result);

                // Si startUpload resuelve correctamente, los callbacks manejan el resto
                // Pero si no hay resultado, significa que algo falló
                if (!result || result.length === 0) {
                    throw new Error("Upload failed - no result returned");
                }
            }
        } catch (e) {
            console.error("Error in handleSaveCrop:", e);
            toast.error("Error al procesar la imagen");
            setIsOpen(false);
        }
    };

    const handleRemove = () => {
        onChange(""); // Limpiamos el string URL
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <>
            <div
                className="flex flex-col items-center gap-4"
                role="button" // Indica que es un botón
                tabIndex={0}  // Permite llegar con la tecla TAB
                onKeyDown={(e) => {
                    // Permite activar con Enter o Espacio
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (!disabled && !isUploading) fileInputRef.current?.click();
                    }
                }}
            >
                {/* CÍRCULO CLICKEABLE */}
                <div
                    className={cn(
                        "relative w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-background hover:bg-background-100 transition cursor-pointer group",
                        value && "border-solid border-primary",
                        isUploading && "opacity-50 cursor-wait"
                    )}
                    onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center text-primary">
                            <Loader2 className="w-8 h-8 mb-1 animate-spin" />
                            <span className="text-xs font-medium">Subiendo...</span>
                        </div>
                    ) : value ? (
                        <Image src={value} fill alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <Camera className="w-8 h-8 mb-1" />
                            <span className="text-xs">Subir foto</span>
                        </div>
                    )}

                    {/* Overlay Hover */}
                    {!disabled && !isUploading && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <span className="text-white text-xs font-medium">Cambiar</span>
                        </div>
                    )}
                </div>

                {/* INPUT OCULTO */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onFileChange}
                />

                {value && !disabled && !isUploading && (
                    <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar foto
                    </Button>
                )}
            </div>

            {/* MODAL DE RECORTE */}
            <Dialog open={isOpen} onOpenChange={(open) => !isUploading && setIsOpen(open)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ajustar Imagen</DialogTitle>
                    </DialogHeader>

                    <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                        <Cropper
                            image={imageSrc || ""}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="py-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">Zoom</span>
                        </div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val) => setZoom(val[0])}
                        />
                    </div>

                    <DialogFooter className="flex flex-col gap-3">
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveCrop} disabled={isUploading}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? "Subiendo..." : "Guardar y Subir"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}