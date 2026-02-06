export interface MetricWithTrend {
    value: number;
    previousValue: number;
    percentageChange: number;
}

export interface DashboardMetrics {
    revenue: MetricWithTrend;
    activeMembers: MetricWithTrend; // "Miembros Activos"
    newMemberships: MetricWithTrend; // "Membresías Nuevas" (para el KPI "Total Miembros" o similar)
    membersByPlan: {
        planName: string;
        count: number;
        revenue: number;
    }[];
    recentActivity: {
        id: string;
        name: string; // firstName + lastName
        email: string;
        avatar?: string | null;
        planName?: string;
        joinedAt: Date;
    }[];
    expiringMemberships: {
        id: string;
        memberName: string;
        planName: string;
        endDate: Date;
        avatar?: string | null;
        daysUntilExpiration: number;
    }[];
}
