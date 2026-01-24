"use client";

import * as React from "react";

interface DashboardContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) {
      setIsSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <DashboardContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
