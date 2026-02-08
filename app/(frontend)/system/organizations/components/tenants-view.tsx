"use client";

import { TenantsTable } from "@/app/(frontend)/system/organizations/components/organizations/tenants-table";
import { useSystemOrganizations } from "@/hooks/system/use-system";

export default function TenantsView() {
    // TODO: Implement pagination state
    const { data: response } = useSystemOrganizations({ page: 1, limit: 100 });

    const organizations = response?.records || [];

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
            </div>
            <TenantsTable data={organizations} />
        </div>
    );
}
