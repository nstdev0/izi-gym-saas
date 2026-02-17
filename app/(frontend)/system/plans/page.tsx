import { systemApi } from "@/lib/api-client/system.api";
import { PlansTable } from "@/app/(frontend)/system/organizations/components/plans/plans-table";

export default async function PlansPage() {
    const plans = await systemApi.getPlans();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PlansTable plans={plans} />
        </div>
    );
}
