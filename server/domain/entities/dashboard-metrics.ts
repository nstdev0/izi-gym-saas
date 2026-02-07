export interface MetricWithTrend {
    value: number;
    previousValue: number;
    percentageChange: number;
}

export interface DashboardMetrics {
    revenue: MetricWithTrend;
    activeMembers: MetricWithTrend;
    expiringSoon: number;
    salesByPlan: {
        planName: string;
        count: number;
        revenue: number;
    }[];
    recentActivity: {
        id: string;
        name: string;
        email: string;
        avatar?: string | null;
        planName?: string;
        joinedAt: Date;
    }[];
    upcomingExpirations: {
        id: string;
        name: string;
        email: string;
        avatar?: string | null;
        planName?: string;
        endDate: Date;
        daysUntil: number;
    }[];
    revenueOverTime: {
        month: string;
        revenue: number;
    }[];
    currency: string;
}
