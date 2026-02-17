export interface SystemStats {
    totalUsers: number;
    totalOrgs: number;
    mrr: number; // Monthly Recurring Revenue
    activeSubs: number;
}

export interface RevenueStats {
    name: string;
    total: number;
    // trend?: number; // removed for now
}

export interface SystemConfig {
    id: string;
    maintenanceMode: boolean;
    globalAnnouncement: string | null;
    createdAt: Date;
    updatedAt: Date;
}
