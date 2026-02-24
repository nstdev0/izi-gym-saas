import { IMembersRepository } from "@/server/application/repositories/members.repository.interface";
import { CreateMemberInput } from "@/server/application/dtos/members.dto";
import { ConflictError } from "@/server/domain/errors/common";
import { generateMemberQrToken } from "@/shared/utils/token-generator";
import { IIMCCalculator } from "@/server/application/services/imc-calculator.interface";
import { Member } from "@/server/domain/entities/Member";
import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IEntitlementService } from "@/server/application/services/entitlement.service.interface";

export class CreateMemberUseCase {
  constructor(
    private readonly repo: IMembersRepository,
    private readonly imcCalculator: IIMCCalculator,
    private readonly permissions: IPermissionService,
    private readonly entitlements: IEntitlementService,
  ) { }

  async execute(input: CreateMemberInput): Promise<Member> {
    this.permissions.require('members:create');
    await this.entitlements.requireLimit('member');

    const errors: string[] = [];

    const validateUniqueDocument = await this.repo.findUnique({ docNumber: input.docNumber, docType: input.docType });
    const validateUniqueEmail = await this.repo.findUnique({ email: input.email });

    if (validateUniqueDocument) errors.push("El número de documento ya esta en uso");
    if (validateUniqueEmail) errors.push("El correo electrónico ya esta en uso");

    if (errors.length > 0) {
      const msg = errors.join(" . ");
      throw new ConflictError(`${msg}`);
    }

    if (input.height && input.weight) {
      const imc = this.imcCalculator.calculate(input.weight, input.height);
      if (imc) input.imc = imc;
    }

    const qrToken = generateMemberQrToken();
    input.qr = qrToken;
    input.isActive = false; // Members start inactive — activated when a membership is created

    return await this.repo.create(input);
  }
}

export type ICreateMemberUseCase = InstanceType<typeof CreateMemberUseCase>;
