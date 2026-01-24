"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    replace(createPageURL(page));
  };

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", value);
    params.set("page", "1"); // Reset to page 1 on limit change
    replace(`${pathname}?${params.toString()}`);
  };

  const currentLimit = searchParams.get("limit") || "10";

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filas por página</span>
        <Select value={currentLimit} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={currentLimit} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground mr-4">
          Página {currentPage} de {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Anterior</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Siguiente</span>
        </Button>
      </div>
    </div>
  );
}
