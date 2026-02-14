"use client";

import { useAppearance } from "@/components/appearance-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckCircle2, Type, Bell, Palette } from "lucide-react"; // Added Palette
import { SketchPicker } from "react-color";
import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface PreferencesFormProps {
    initialNotifications?: {
        email?: boolean;
        push?: boolean;
    };
}

export function PreferencesForm({ initialNotifications }: PreferencesFormProps) {
    const { font, setFont, primaryColor, setPrimaryColor, savePreferences } = useAppearance();
    const [notifications, setNotifications] = useState(initialNotifications || { email: true, push: false });

    const handleSavePreferences = async () => {
        try {
            await savePreferences();
            toast.success("Preferencias guardadas correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar preferencias");
        }
    };

    const handleNotificationChange = async (key: keyof typeof notifications, value: boolean) => {
        const newNotifications = { ...notifications, [key]: value };
        setNotifications(newNotifications);

        try {
            await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    preferences: {
                        notifications: newNotifications
                    }
                }),
            });
            toast.success("Preferencia actualizada");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar preferencia");
            // Revert state on error if needed
        }
    };

    return (
        <div className="space-y-6">
            {/* Appearance Section */}
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Type className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Apariencia Visual</CardTitle>
                            <CardDescription>
                                Personaliza la tipografía del sistema.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <RadioGroup
                        defaultValue={font}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onValueChange={(value) => setFont(value as any)}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        {/* Opción INTER */}
                        <FontOption value="inter" label="Inter" description="Neutral & Clean" currentFont={font} />
                        {/* Opción OUTFIT */}
                        <FontOption value="outfit" label="Outfit" description="Modern & Geometric" currentFont={font} />
                        {/* Opción LATO */}
                        <FontOption value="lato" label="Lato" description="Friendly & Warm" currentFont={font} />
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Color Preference Section */}
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Color de Acento</CardTitle>
                            <CardDescription>
                                Personaliza el color principal de la interfaz.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                        <Label className="text-base">Color Primario</Label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full max-w-xs justify-start text-left font-normal shadow-sm"
                                            style={{ backgroundColor: primaryColor || undefined, color: getContrastColor(primaryColor || "#000000") }}
                                        >
                                            {primaryColor || "Seleccionar color"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <SketchPicker
                                            color={primaryColor || "#000000"}
                                            onChange={(color) => setPrimaryColor(color.hex)}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {primaryColor && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setPrimaryColor("")}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Restaurar
                                    </Button>
                                )}
                            </div>


                        </div>
                        <p className="text-sm text-muted-foreground">
                            Este color se aplicará a botones, enlaces y elementos destacados.
                        </p>
                    </div>
                </CardContent>
            </Card >

            {/* Notifications Section */}
            < Card className="border-none shadow-md bg-card" >
                <CardHeader className="border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Notificaciones Personales</CardTitle>
                            <CardDescription>
                                Gestiona cómo recibes las alertas.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Notificaciones por Email</Label>
                            <p className="text-sm text-muted-foreground">
                                Recibe resúmenes semanales y alertas importantes.
                            </p>
                        </div>
                        <Switch
                            checked={notifications.email}
                            onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                        />
                    </div>
                    {/* Placeholder for Push Notifications - Future Implementation */}
                    {/* 
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Notificaciones Push</Label>
                            <p className="text-sm text-muted-foreground">
                                Recibe alertas en el navegador.
                            </p>
                        </div>
                        <Switch
                            checked={notifications.push}
                            onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                        />
                    </div>
                    */}

                </CardContent>
            </Card >
            <div className="flex justify-end">
                <Button
                    onClick={handleSavePreferences}
                    className="w-full sm:w-auto"
                >
                    Guardar Preferencias
                </Button>
            </div>
        </div >
    );
}

function FontOption({ value, label, description, currentFont }: { value: string, label: string, description: string, currentFont: string }) {
    return (
        <div className="relative">
            <RadioGroupItem value={value} id={`font-${value}`} className="peer sr-only" />
            <Label
                htmlFor={`font-${value}`}
                className={cn(
                    "flex flex-col justify-between h-full rounded-xl border-2 border-muted bg-card p-4 cursor-pointer transition-all duration-300",
                    "hover:border-primary/50 hover:shadow-md hover:bg-accent/5",
                    "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary/20"
                )}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-base font-bold block">{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-primary opacity-0 transition-opacity peer-data-[state=checked]:opacity-100 hidden peer-data-[state=checked]:block" />
                </div>

                <div className="space-y-4" style={{ fontFamily: `var(--font-${value})` }}>
                    <div className="text-4xl font-normal text-foreground/80">Aa</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        El veloz murciélago hindú comía feliz cardillo y kiwi. 1234567890
                    </p>
                </div>
            </Label>
            <div className="absolute top-4 right-4 hidden peer-data-[state=checked]:block text-primary animate-in fade-in zoom-in duration-200">
                <CheckCircle2 className="w-5 h-5 fill-primary/10" />
            </div>
        </div>
    );
}

function getContrastColor(hexColor: string) {
    if (!hexColor || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexColor)) return "#ffffff";

    if (hexColor.length === 4) {
        hexColor = "#" + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
    }

    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? "#000000" : "#ffffff";
}
