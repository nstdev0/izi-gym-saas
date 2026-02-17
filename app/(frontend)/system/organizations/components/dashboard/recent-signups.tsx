"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Organization } from "@/shared/types/organizations.types";

interface RecentSignupsProps {
    signups: Organization[];
}

export function RecentSignups({ signups }: RecentSignupsProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {signups.map((org) => (
                        <div key={org.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={org.image || undefined} alt="Avatar" />
                                <AvatarFallback>{org.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{org.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {org.slug}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                {new Date(org.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
