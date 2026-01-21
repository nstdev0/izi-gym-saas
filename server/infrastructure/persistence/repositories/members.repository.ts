import { IMembersRepository } from "@repositories/members.repository.interface";
import { Member } from "@entities/Member";
import { BaseRepository } from "./base.repository";

export class MembersRepository
  extends BaseRepository<Member>
  implements IMembersRepository {}
