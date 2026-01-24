"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function DashboardLayout({
  children,
  breadcrumbs = [],
}: DashboardLayoutProps) {
  return (
    <div className="flex-1 space-y-4 h-full flex flex-col overflow-hidden">
      {breadcrumbs.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2 shrink-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}
