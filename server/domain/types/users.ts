import { Role } from "@/generated/prisma/client";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash?: string;
  role: Role; // Used string in previous interface, but Role enum is better if available
  isActive?: boolean;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface UsersFilters {
  search?: string;
  role?: Role;
  isActive?: boolean;
}
