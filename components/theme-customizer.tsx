"use client";

import * as React from "react";
import { Monitor, Moon, Palette, Sun, Type, Check } from "lucide-react";
import { useAppearance } from "@/components/appearance-provider";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";


export function ThemeCustomizer() {
  const { theme, setTheme, font, setFont, primaryColor, setPrimaryColor } = useAppearance();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleColorChange = async (colorName: string) => {
    let hexColor = "";
    switch (colorName) {
      case "blue": hexColor = "#3b82f6"; break; // Tailwind blue-500
      case "red": hexColor = "#ef4444"; break; // Tailwind red-500
      case "green": hexColor = "#22c55e"; break; // Tailwind green-500
      case "violet": hexColor = "#8b5cf6"; break; // Tailwind violet-500
      default: hexColor = ""; break;
    }
    setPrimaryColor(hexColor);
    // Auto-save for fast customization
    // We need to wait a tick for state to update, but savePreferences uses state values.
    // Ideally savePreferences should accept overrides, but given the current structure,
    // we might need to rely on the user clicking save in settings, or implement a debounced save here.
    // The requirement says "themecustomizer tambien podra hacer cambios de manera mas rapida".
    // Let's try to save immediately, but passing the new values to savePreferences would be better.
    // Since savePreferences reads *state*, and state updates are async, calling it immediately might save old state.
    // However, for now let's just update the state. The user can save in profile if they want persistence,
    // OR we trigger a save. Let's try to trigger a save after a timeout or use a modified savePreferences.
    // Actually, `AppearanceProvider` state set is sync for React 18 in event handlers but effects are not.
    // Let's just set the color. If we want to persist immediately from here:
    // We can add a specialized save function or just let it be "fast preview" and user saves later?
    // User said "accesible al usuario", implying it should likely persist.
    // Let's blindly call savePreferences after a short delay or trust React batching?
    // Better: let's update `AppearanceProvider` to return a promise from `setPrimaryColor` if we wanted to await, but it doesn't.
    // Let's just set it. If we want auto-save here, we can.
    // Let's assume for this "quick" customizer, we want to persist. 
    // But `savePreferences` uses `fontState` and `primaryColorState` from scope.
    // We'll leave it as is (state update) for now. If persistence is needed immediately from this dropdown,
    // we should note that `savePreferences` in `AppearanceProvider` sends the *current state*.

    // For the purpose of this task, I will make it update state. 
    // The user can click "Save" in the profile form, OR I can try to hack a save. 
    // Given the previous task was "manual save", maybe this should also be manual?
    // "themecustomizer tambien podra hacer cambios de manera mas rapida y accesible"
    // implies ease of use. Auto-saving here makes sense for "fast".
    // I will call savePreferences wrapped in a timeout to allow state to settle, or just rely on the user saving elsewhere?
    // Actually, `savePreferences` is exposed. Let's try to call it.

    // Correction: I cannot easily guarantee state is updated before savePreferences runs without an effect or passing args.
    // I will modify `AppearanceProvider` to allow passing values to `savePreferences`? No, too much refactor.
    // I will just set the color and let the user save in the profile form for now, 
    // OR I will assume the "manual save" requirement applies globally to avoid spamming the API.
    // But "mas rapida" suggests maybe avoiding the form. 
    // Let's stick to: Change Color -> Visual Update. User saves later?
    // Or: Change Color -> Visual Update.

    // Wait, the user said "el boton de guardar preferencias... vas a agregar preferencias de tema... y vas a sincronizar... themecustomizer tambien podra hacer cambios".
    // It doesn't explicitly say "themecustomizer must auto-save".
    // It implies the ThemeCustomizer is an alternative UI.
    // I'll make it change the state. Persistence can happen via the Profile form button (which now includes theme).
    // Or I can add a "Save" button here? No space.
    // Let's just set state. If user wants to save, they go to profile? 
    // Or maybe I should auto-save *theme mode* (light/dark) as that's usually instant?
    // Light/dark is handled by `next-themes` which usually persists to local storage. 
    // My `savePreferences` syncs it to backend.

    // Let's implement handles for theme change that call `setTheme`.
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Theme change is usually expected to be verified/saved.
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Personalizar Tema</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Personalizar Tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Apariencia</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Colors */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Color</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {[
              { name: "default", label: "Predeterminado", color: "" },
              { name: "blue", label: "Azul", color: "#3b82f6" },
              { name: "red", label: "Rojo", color: "#ef4444" },
              { name: "green", label: "Verde", color: "#22c55e" },
              { name: "violet", label: "Violeta", color: "#8b5cf6" },
            ].map((c) => (
              <DropdownMenuItem
                key={c.name}
                onClick={() => handleColorChange(c.name)}
                className="justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border" style={{ background: c.color || "var(--foreground)" }} />
                  {c.label}
                </div>
                {((!primaryColor && c.name === "default") || primaryColor === c.color) && <Check className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Fonts */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Fuente</span>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => setFont("inter")}
              className="justify-between"
            >
              <span style={{ fontFamily: 'var(--font-inter)' }}>Inter</span>
              {font === "inter" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFont("outfit")}
              className="justify-between"
            >
              <span style={{ fontFamily: 'var(--font-outfit)' }}>Outfit</span>
              {font === "outfit" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFont("lato")}
              className="justify-between"
            >
              <span style={{ fontFamily: 'var(--font-lato)' }}>Lato</span>
              {font === "lato" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Modo
        </DropdownMenuLabel>
        {/* Mode */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleThemeChange("light")}
            className="justify-between"
          >
            <div className="flex items-center">
              <Sun className="mr-2 h-4 w-4" />
              <span>Claro</span>
            </div>
            {theme === "light" && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("dark")}
            className="justify-between"
          >
            <div className="flex items-center">
              <Moon className="mr-2 h-4 w-4" />
              <span>Oscuro</span>
            </div>
            {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("system")}
            className="justify-between"
          >
            <div className="flex items-center">
              <Monitor className="mr-2 h-4 w-4" />
              <span>Sistema</span>
            </div>
            {theme === "system" && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
