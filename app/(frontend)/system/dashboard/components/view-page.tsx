"use client";

import { KpiGrid } from "@/app/(frontend)/system/organizations/components/dashboard/kpi-grid";
import { RecentSignups } from "@/app/(frontend)/system/organizations/components/dashboard/recent-signups";
import { RevenueChart } from "@/app/(frontend)/system/organizations/components/dashboard/revenue-chart";
import { useSystemRecentSignups, useSystemRevenueStats, useSystemStats } from "@/hooks/system/use-system";

export default function SystemDashboardView() {
    const { data: stats = { totalUsers: 0, totalOrgs: 0, mrr: 0, activeSubs: 0 } } = useSystemStats();
    const { data: recentSignups = [] } = useSystemRecentSignups();
    const { data: revenueStats = [] } = useSystemRevenueStats();

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard (GOD Mode)</h2>
            </div>

            <KpiGrid stats={stats} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RevenueChart data={revenueStats} />
                <RecentSignups signups={recentSignups} />
            </div>
        </div>
    );
}
