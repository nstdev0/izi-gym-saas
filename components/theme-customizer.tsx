"use client";

import * as React from "react";
import { Monitor, Moon, Palette, Sun, Type, Check } from "lucide-react";
import { useTheme } from "next-themes";

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
  const { setTheme, theme } = useTheme();
  const [color, setColor] = React.useState("default");
  const [font, setFont] = React.useState("sans");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Initial load from storage or document state if possible
    const savedColor = localStorage.getItem("theme-color") || "default";
    const savedFont = localStorage.getItem("theme-font") || "sans";

    setColor(savedColor);
    setFont(savedFont);

    // Apply immediately
    document.documentElement.setAttribute("data-theme", savedColor);
    document.documentElement.setAttribute("data-font", savedFont);
  }, []);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    localStorage.setItem("theme-color", newColor);
    document.documentElement.setAttribute("data-theme", newColor);
  };

  const handleFontChange = (newFont: string) => {
    setFont(newFont);
    localStorage.setItem("theme-font", newFont);
    document.documentElement.setAttribute("data-font", newFont);
  };

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
        <Button variant="outline" size="icon">
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
              { name: "default", label: "Predeterminado" },
              { name: "blue", label: "Azul" },
              { name: "red", label: "Rojo" },
              { name: "green", label: "Verde" },
            ].map((c) => (
              <DropdownMenuItem
                key={c.name}
                onClick={() => handleColorChange(c.name)}
                className="justify-between"
              >
                {c.label}
                {color === c.name && <Check className="h-4 w-4 ml-2" />}
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
              onClick={() => handleFontChange("sans")}
              className="justify-between"
            >
              <span className="font-sans">Sans (Inter)</span>
              {font === "sans" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFontChange("serif")}
              className="justify-between"
            >
              <span className="font-serif">Serif (Playfair)</span>
              {font === "serif" && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleFontChange("mono")}
              className="justify-between"
            >
              <span className="font-mono">Mono (JetBrains)</span>
              {font === "mono" && <Check className="h-4 w-4 ml-2" />}
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
            onClick={() => setTheme("light")}
            className="justify-between"
          >
            <div className="flex items-center">
              <Sun className="mr-2 h-4 w-4" />
              <span>Claro</span>
            </div>
            {theme === "light" && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="justify-between"
          >
            <div className="flex items-center">
              <Moon className="mr-2 h-4 w-4" />
              <span>Oscuro</span>
            </div>
            {theme === "dark" && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
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
