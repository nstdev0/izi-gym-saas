"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SystemService } from "@/lib/services/system.service";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface PlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plan?: any;
}

export function PlanDialog({ open, onOpenChange, plan }: PlanDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            description: formData.get("description"),
            price: Number(formData.get("price")),
            limits: {
                maxMembers: Number(formData.get("maxMembers")),
                maxProducts: Number(formData.get("maxProducts")),
            }
        };

        try {
            if (plan) {
                await SystemService.updatePlan(plan.id, data);
                toast.success("Plan updated successfully");
            } else {
                await SystemService.createPlan(data);
                toast.success("Plan created successfully");
            }
            onOpenChange(false);
        } catch {
            toast.error("Failed to save plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{plan ? "Edit Plan" : "Create Plan"}</DialogTitle>
                    <DialogDescription>
                        {plan ? "Update existing plan details." : "Add a new plan to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={plan?.name}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={plan?.description}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={plan?.price}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="maxMembers" className="text-right">
                                Max Members
                            </Label>
                            <Input
                                id="maxMembers"
                                name="maxMembers"
                                type="number"
                                defaultValue={plan?.limits?.maxMembers}
                                className="col-span-3"
                                placeholder="Unlimited if empty"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="maxProducts" className="text-right">
                                Max Products
                            </Label>
                            <Input
                                id="maxProducts"
                                name="maxProducts"
                                type="number"
                                defaultValue={plan?.limits?.maxProducts}
                                className="col-span-3"
                                placeholder="Unlimited if empty"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
