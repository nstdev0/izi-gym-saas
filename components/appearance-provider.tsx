"use client";

import { createContext, useContext, useEffect, useState } from "react";


import { useTheme } from "next-themes";

type FontType = "inter" | "outfit" | "lato";

interface AppearanceContextType {
    font: FontType;
    setFont: (font: FontType) => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    savePreferences: () => Promise<void>;
    theme: string | undefined;
    setTheme: (theme: string) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children, initialFont, initialColor, initialTheme }: { children: React.ReactNode, initialFont?: FontType, initialColor?: string, initialTheme?: string }) {
    const { theme, setTheme } = useTheme();
    const [fontState, setFontState] = useState<FontType>(() => {
        if (initialFont) return initialFont;

        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("izi-gym-saas-font") as FontType;
            if (saved && ["inter", "outfit", "lato"].includes(saved)) {
                return saved;
            }
        }
        return "inter";
    });

    const [primaryColorState, setPrimaryColorState] = useState<string>(() => {
        if (initialColor) return initialColor;
        if (typeof window !== 'undefined') {
            return localStorage.getItem("izi-gym-saas-primary-color") || "";
        }
        return "";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-font", fontState);
    }, [fontState]);

    useEffect(() => {
        if (primaryColorState) {
            document.documentElement.style.setProperty("--primary", primaryColorState);
            document.documentElement.style.setProperty("--ring", primaryColorState);
            document.documentElement.style.setProperty("--sidebar-primary", primaryColorState);

            // Calculate contrast for foreground
            const foreground = getContrastColor(primaryColorState);
            document.documentElement.style.setProperty("--primary-foreground", foreground);
            document.documentElement.style.setProperty("--sidebar-primary-foreground", foreground);
        } else {
            document.documentElement.style.removeProperty("--primary");
            document.documentElement.style.removeProperty("--ring");
            document.documentElement.style.removeProperty("--sidebar-primary");
            document.documentElement.style.removeProperty("--primary-foreground");
            document.documentElement.style.removeProperty("--sidebar-primary-foreground");
        }
    }, [primaryColorState]);

    const setFont = (newFont: FontType) => {
        setFontState(newFont);
    };

    const setPrimaryColor = (newColor: string) => {
        setPrimaryColorState(newColor);
    }

    const savePreferences = async () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem("izi-gym-saas-font", fontState);
            localStorage.setItem("izi-gym-saas-primary-color", primaryColorState);
        }

        try {
            await fetch("/api/user/preferences", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    preferences: {
                        appearance: {
                            font: fontState,
                            primaryColor: primaryColorState,
                            theme: theme
                        }
                    }
                }),
            });
        } catch (error) {
            console.error("Failed to save preferences", error);
            throw error;
        }
    }

    return (
        <AppearanceContext.Provider value={{ font: fontState, setFont, primaryColor: primaryColorState, setPrimaryColor, savePreferences, theme, setTheme }}>
            {children}
        </AppearanceContext.Provider>
    );
}


export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error("useAppearance must be used within an AppearanceProvider");
    }
    return context;
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