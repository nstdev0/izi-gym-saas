"use client";

import { useAppearance } from "@/components/appearance-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { CheckCircle2, Type } from "lucide-react";

export function AppearanceSettings() {
    const { font, setFont } = useAppearance();

    return (
        <Card className="border-none shadow-md bg-linear-to-br from-card to-muted/20">
            <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Type className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Apariencia Visual</CardTitle>
                        <CardDescription>
                            Personaliza la tipografía del sistema. Los cambios se guardan en tu navegador.
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
                    <div className="relative">
                        <RadioGroupItem value="inter" id="font-inter" className="peer sr-only" />
                        <Label
                            htmlFor="font-inter"
                            className={cn(
                                "flex flex-col justify-between h-full rounded-xl border-2 border-muted bg-card p-4 cursor-pointer transition-all duration-300",
                                "hover:border-primary/50 hover:shadow-md hover:bg-accent/5",
                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-base font-bold block">Inter</span>
                                    <span className="text-xs text-muted-foreground">Neutral & Clean</span>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-primary opacity-0 transition-opacity peer-data-[state=checked]:opacity-100 hidden peer-data-[state=checked]:block" />
                            </div>

                            <div className="space-y-4" style={{ fontFamily: 'var(--font-inter)' }}>
                                <div className="text-4xl font-normal text-foreground/80">Aa</div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    El veloz murciélago hindú comía feliz cardillo y kiwi. 1234567890
                                </p>
                            </div>
                        </Label>
                        {/* Indicador Check para animaciones CSS puras si se prefiere */}
                        <div className="absolute top-4 right-4 hidden peer-data-[state=checked]:block text-primary animate-in fade-in zoom-in duration-200">
                            <CheckCircle2 className="w-5 h-5 fill-primary/10" />
                        </div>
                    </div>

                    {/* Opción OUTFIT */}
                    <div className="relative">
                        <RadioGroupItem value="outfit" id="font-outfit" className="peer sr-only" />
                        <Label
                            htmlFor="font-outfit"
                            className={cn(
                                "flex flex-col justify-between h-full rounded-xl border-2 border-muted bg-card p-4 cursor-pointer transition-all duration-300",
                                "hover:border-primary/50 hover:shadow-md hover:bg-accent/5",
                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-base font-bold block">Outfit</span>
                                    <span className="text-xs text-muted-foreground">Modern & Geometric</span>
                                </div>
                            </div>

                            <div className="space-y-4" style={{ fontFamily: 'var(--font-outfit)' }}>
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

                    {/* Opción LATO */}
                    <div className="relative">
                        <RadioGroupItem value="lato" id="font-lato" className="peer sr-only" />
                        <Label
                            htmlFor="font-lato"
                            className={cn(
                                "flex flex-col justify-between h-full rounded-xl border-2 border-muted bg-card p-4 cursor-pointer transition-all duration-300",
                                "hover:border-primary/50 hover:shadow-md hover:bg-accent/5",
                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-base font-bold block">Lato</span>
                                    <span className="text-xs text-muted-foreground">Friendly & Warm</span>
                                </div>
                            </div>

                            <div className="space-y-4" style={{ fontFamily: 'var(--font-lato)' }}>
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
                </RadioGroup>
            </CardContent>
        </Card>
    );
}