export default function getPlanBadgeVariant(plan: string): "default" | "secondary" | "destructive" | "outline" {
    switch (plan.toLowerCase()) {
        case "premium":
            return "default";
        case "elite":
            return "destructive";
        default:
            return "secondary";
    }
}