
import { createContext } from "@/server/lib/api-handler";
import { UpdateOrganizationSettingsSchema } from "@/server/application/dtos/organizations.dto";

export const PATCH = createContext(
    (container) => container.updateOrganizationSettingsController,
    async (req) => {
        const body = await req.json();
        return UpdateOrganizationSettingsSchema.parse(body);
    }
);
