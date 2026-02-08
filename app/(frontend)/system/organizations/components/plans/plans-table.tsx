"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { useState } from "react";
import { PlanDialog } from "./plan-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlansTableProps {
    plans: any[];
}

export function PlansTable({ plans }: PlansTableProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    const handleCreate = () => {
        setSelectedPlan(null);
        setDialogOpen(true);
    };

    const handleEdit = (plan: any) => {
        setSelectedPlan(plan);
        setDialogOpen(true);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold tracking-tight">Plans</h2>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Plan
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Available Plans</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Limits</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                    <TableCell>{plan.slug}</TableCell>
                                    <TableCell>${Number(plan.price).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground">
                                            Members: {plan.limits?.maxMembers || '∞'} <br />
                                            Products: {plan.limits?.maxProducts || '∞'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {plans.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No plans found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <PlanDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                plan={selectedPlan}
            />
        </>
    );
}
