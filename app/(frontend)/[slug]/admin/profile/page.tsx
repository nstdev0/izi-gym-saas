import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileViewPage from "./view-page";

export default async function ProfilePage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return <ProfileViewPage />;
}
