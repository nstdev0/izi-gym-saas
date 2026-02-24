
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SettingsViewPage from "./view-page";

export default async function SettingsPage() {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        redirect("/");
    }

    return <SettingsViewPage orgId={orgId} />;
}
