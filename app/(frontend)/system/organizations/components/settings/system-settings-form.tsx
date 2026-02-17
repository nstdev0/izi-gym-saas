"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { systemApi } from "@/lib/api-client/system.api";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

const systemSettingsSchema = z.object({
    maintenanceMode: z.boolean(),
    globalAnnouncement: z.string().optional(),
});

type SystemSettingsValues = z.infer<typeof systemSettingsSchema>;

interface SystemSettingsFormProps {
    initialData: SystemSettingsValues;
    onSubmit?: (data: SystemSettingsValues) => void;
    isSubmitting?: boolean;
}

export function SystemSettingsForm({ initialData, onSubmit: externalSubmit, isSubmitting = false }: SystemSettingsFormProps) {
    const [internalLoading, setInternalLoading] = useState(false);

    const form = useForm<SystemSettingsValues>({
        resolver: zodResolver(systemSettingsSchema),
        defaultValues: {
            maintenanceMode: initialData?.maintenanceMode || false,
            globalAnnouncement: initialData?.globalAnnouncement || "",
        }
    });

    async function onSubmit(data: SystemSettingsValues) {
        if (externalSubmit) {
            externalSubmit(data);
            return;
        }

        setInternalLoading(true);
        try {
            await systemApi.updateSystemConfig(data);
            toast.success("System settings updated");
        } catch {
            toast.error("Failed to update settings");
        } finally {
            setInternalLoading(false);
        }
    }

    const loading = isSubmitting || internalLoading;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h3 className="text-lg font-medium">Global Configuration</h3>
                <p className="text-sm text-muted-foreground">
                    Manage system-wide settings and alerts.
                </p>
            </div>
            <Separator />

            <Controller
                control={form.control}
                name="maintenanceMode"
                render={({ field, fieldState }) => (
                    <Field
                        orientation="horizontal"
                        className="justify-between rounded-lg border p-4"
                        data-invalid={fieldState.invalid}
                    >
                        <div className="space-y-0.5">
                            <FieldLabel className="text-base">Maintenance Mode</FieldLabel>
                            <FieldDescription>
                                Prevent non-admin users from accessing the platform.
                            </FieldDescription>
                        </div>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </Field>
                )}
            />

            <Controller
                control={form.control}
                name="globalAnnouncement"
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Global Announcement</FieldLabel>
                        <Input placeholder="System undergoing maintenance at 02:00 AM..." {...field} />
                        <FieldDescription>
                            This message will be displayed at the top of the application for all users.
                        </FieldDescription>
                        {fieldState.invalid && fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                )}
            />

            <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
            </Button>
        </form>
    );
}
