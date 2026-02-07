"use client";

import { createContext, useContext, useEffect, useState } from "react";

type FontType = "inter" | "outfit" | "lato";

interface AppearanceContextType {
    font: FontType;
    setFont: (font: FontType) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
    const [font, setFontState] = useState<FontType>("inter");

    useEffect(() => {
        // Load from localStorage on mount
        const savedFont = localStorage.getItem("gym-dashboard-font") as FontType;
        if (savedFont && ["inter", "outfit", "lato"].includes(savedFont)) {
            setFontState(savedFont);
            document.documentElement.setAttribute("data-font", savedFont);
        } else {
            document.documentElement.setAttribute("data-font", "inter");
        }
    }, []);

    const setFont = (newFont: FontType) => {
        setFontState(newFont);
        localStorage.setItem("gym-dashboard-font", newFont);
        document.documentElement.setAttribute("data-font", newFont);
    };

    return (
        <AppearanceContext.Provider value={{ font, setFont }}>
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
