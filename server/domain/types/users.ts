import { Role } from "@/generated/prisma/client";

export interface CreateUserInput {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string; // Optional because validation handles it, but logic needs it
  role: Role;
  isActive: boolean;
  image?: string | null;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface UsersFilters {
  search?: string;
  sort?: string;
}
