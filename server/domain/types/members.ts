import { DocType, Gender } from "../entities/Member";

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  docType: DocType;
  docNumber: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: Date | null;
  gender?: Gender | null;
  height?: number | null;
  weight?: number | null;
  imc?: number | null;
  image?: string | null;
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {
  isActive?: boolean;
}
