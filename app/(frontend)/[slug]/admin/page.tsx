
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        if (params.slug) {
            router.push(`/${params.slug}/admin/dashboard`);
        }
    }, [params, router]);

    return null;
}
