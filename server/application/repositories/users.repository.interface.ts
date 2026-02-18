import { User } from "@/server/domain/entities/User";
import { IBaseRepository } from "./base.repository.interface";
import {
  CreateUserInput,
  UpdateUserInput,
  UsersFilters,
} from "@/server/domain/types/users";

export type { CreateUserInput, UpdateUserInput, UsersFilters };

export interface IUsersRepository extends IBaseRepository<
  User,
  CreateUserInput,
  UpdateUserInput,
  UsersFilters
> {
  countActive(organizationId: string): Promise<number>
}
