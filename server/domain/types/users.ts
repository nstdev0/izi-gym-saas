import { Role } from "@/shared/types/users.types";

export interface CreateUserInput {
  id?: string;
  organizationId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: Role;
  isActive: boolean;
  image?: string | null;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface UsersFilters {
  search?: string;
  sort?: string;
  role?: string;
  status?: string
}
