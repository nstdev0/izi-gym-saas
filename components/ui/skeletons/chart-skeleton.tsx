import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
    return (
        <Card className="shadow-lg border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/50">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-8 w-[130px]" />
            </CardHeader>
            <CardContent className="pl-0 pt-6 pr-6">
                <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2">
                    <Skeleton className="h-[60%] w-full rounded-t-lg" />
                    <Skeleton className="h-[80%] w-full rounded-t-lg" />
                    <Skeleton className="h-[40%] w-full rounded-t-lg" />
                    <Skeleton className="h-[90%] w-full rounded-t-lg" />
                    <Skeleton className="h-[50%] w-full rounded-t-lg" />
                    <Skeleton className="h-[70%] w-full rounded-t-lg" />
                    <Skeleton className="h-[30%] w-full rounded-t-lg" />
                </div>
            </CardContent>
        </Card>
    );
}
