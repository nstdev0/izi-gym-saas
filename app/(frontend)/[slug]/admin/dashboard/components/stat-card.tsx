import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ElementType;
    prefix?: string;
    isLoading?: boolean;
}

export default function StatCard({ title, value, change, icon: Icon, prefix = "", isLoading }: StatCardProps) {
    const isPositive = change >= 0;

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {title}
                        </p>
                        {isLoading ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                        )}
                        <div className="flex items-center gap-1">
                            {isLoading ? (
                                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    {isPositive ? (
                                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                    )}
                                    <span
                                        className={`text-xs sm:text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {isPositive ? "+" : ""}{change.toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">vs periodo anterior</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="rounded-full bg-primary/10 p-2 sm:p-3">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}