"use client";

import { useAppearance } from "@/components/appearance-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AppearanceSettings() {
    const { font, setFont } = useAppearance();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Apariencia Visual</CardTitle>
                <CardDescription>
                    Personaliza la tipografía del tablero. Esta preferencia se guarda en tu navegador.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    defaultValue={font}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onValueChange={(value) => setFont(value as any)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <div>
                        <RadioGroupItem value="inter" id="font-inter" className="peer sr-only" />
                        <Label
                            htmlFor="font-inter"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary font-sans"
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            <span className="text-xl font-bold">Inter</span>
                            <span className="text-sm text-muted-foreground">Neutral & Clean</span>
                            <span className="mt-2 text-xs">Ag The quick brown fox</span>
                        </Label>
                    </div>

                    <div>
                        <RadioGroupItem value="outfit" id="font-outfit" className="peer sr-only" />
                        <Label
                            htmlFor="font-outfit"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            style={{ fontFamily: 'var(--font-outfit)' }}
                        >
                            <span className="text-xl font-bold">Outfit</span>
                            <span className="text-sm text-muted-foreground">Brand & Modern</span>
                            <span className="mt-2 text-xs">Ag The quick brown fox</span>
                        </Label>
                    </div>

                    <div>
                        <RadioGroupItem value="lato" id="font-lato" className="peer sr-only" />
                        <Label
                            htmlFor="font-lato"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            style={{ fontFamily: 'var(--font-lato)' }}
                        >
                            <span className="text-xl font-bold">Lato</span>
                            <span className="text-sm text-muted-foreground">Friendly & Warm</span>
                            <span className="mt-2 text-xs">Ag The quick brown fox</span>
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
