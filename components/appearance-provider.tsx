"use client";

import { createContext, useContext, useEffect, useState } from "react";

type FontType = "inter" | "outfit" | "lato";

interface AppearanceContextType {
    font: FontType;
    setFont: (font: FontType) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children, initialFont }: { children: React.ReactNode, initialFont?: FontType }) {
    const [fontState, setFontState] = useState<FontType>(() => {
        if (initialFont) return initialFont;

        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("gym-dashboard-font") as FontType;
            if (saved && ["inter", "outfit", "lato"].includes(saved)) {
                return saved;
            }
        }
        return "inter";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-font", fontState);
    }, [fontState]);

    const setFont = async (newFont: FontType) => {
        setFontState(newFont);

        if (typeof window !== 'undefined') {
            localStorage.setItem("gym-dashboard-font", newFont);
        }

        try {
            await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    settings: {
                        appearance: { font: newFont }
                    }
                }),
            });
        } catch (error) {
            console.error("Failed to save font preference", error);
        }
    };

    return (
        <AppearanceContext.Provider value={{ font: fontState, setFont }}>
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