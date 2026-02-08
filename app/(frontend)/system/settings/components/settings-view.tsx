"use client";

import { useSystemConfig, useUpdateSystemConfig } from "@/hooks/system/use-system";
import { SystemSettingsForm } from "@/app/(frontend)/system/organizations/components/settings/system-settings-form";

export default function SettingsView() {
    const { data: config } = useSystemConfig();
    const { mutate: updateConfig, isPending } = useUpdateSystemConfig();

    if (!config) return null; // Or loading skeleton

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <SystemSettingsForm
                initialData={config}
                onSubmit={(data) => updateConfig(data)}
                isSubmitting={isPending}
            />
        </div>
    );
}
