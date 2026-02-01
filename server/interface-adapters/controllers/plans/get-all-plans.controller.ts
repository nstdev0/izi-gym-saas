import { GetAllPlansUseCase } from "@/server/application/use-cases/plans/get-all-plans.use-case";
import { PlansFilters } from "@/server/application/repositories/plans.repository.interface";
import { PageableRequest } from "@/server/shared/common/pagination";
import { NextResponse } from "next/server";

export class GetAllPlansController {
  constructor(private readonly useCase: GetAllPlansUseCase) {}

  async execute(input: PageableRequest<PlansFilters>): Promise<NextResponse> {
    try {
      const result = await this.useCase.execute(input);
      return NextResponse.json(result);
    } catch (error: unknown) {
      console.error("[GET_ALL_PLANS_ERROR]", error);
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ message }, { status: 500 });
    }
  }
}
