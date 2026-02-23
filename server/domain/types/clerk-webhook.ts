export interface SyncUserInput {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
}

export interface SyncOrganizationInput {
    id: string;
    name: string;
    slug: string | null;
    image: string | null;
}

export interface SyncMembershipInput {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    role: "org:admin" | "org:member" | string;
    organization: SyncOrganizationInput;
}
