import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../infrastructure/persistence/prisma";

// --- Imports: Organizations ---
import { OrganizationsRepository } from "../infrastructure/persistence/repositories/organizations.repository";
import { GetAllOrganizationsUseCase } from "../application/use-cases/organizations/get-all-organizations.use-case";
import { CreateOrganizationUseCase } from "../application/use-cases/organizations/create-organization.use-case";
import { GetAllOrganizationsController } from "../interface-adapters/controllers/organizations/get-all-organizations.controller";
import { CreateOrganizationController } from "../interface-adapters/controllers/organizations/create-organization.controller";
import { GetOrganizationByIdUseCase } from "@/server/application/use-cases/organizations/get-organization-by-id.use-case";
import { UpdateOrganizationUseCase } from "@/server/application/use-cases/organizations/update-organization.use-case";
import { DeleteOrganizationUseCase } from "@/server/application/use-cases/organizations/delete-organization.use-case";
import { GetOrganizationByIdController } from "@/server/interface-adapters/controllers/organizations/get-organization-by-id.controller";
import { UpdateOrganizationController } from "@/server/interface-adapters/controllers/organizations/update-organization.controller";
import { DeleteOrganizationController } from "@/server/interface-adapters/controllers/organizations/delete-organization.controller";
import { GetOrganizationController } from "@/server/interface-adapters/controllers/organization/get-organization.controller";
import { GetOrganizationUseCase } from "@/server/application/use-cases/organization/get-organization.use-case";
import { UpdateOrganizationSettingsController } from "@/server/interface-adapters/controllers/organization/update-organization-settings.controller";
import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organization/update-organization-settings.use-case";

// --- Imports: Members ---
import { MembersRepository } from "@persistence/repositories/members.repository";
import { GetAllMembersUseCase } from "@use-cases/members/get-all-members.use-case";
import { CreateMemberUseCase } from "@use-cases/members/create-member.use-case";
import { GetMemberByIdUseCase } from "@/server/application/use-cases/members/get-member-by-id.use-case";
import { UpdateMemberUseCase } from "@/server/application/use-cases/members/update-member.use-case";
import { DeleteMemberUseCase } from "@/server/application/use-cases/members/delete-member.use-case";
import { GetAllMembersController } from "@controllers/members/get-all-members.controller";
import { CreateMemberController } from "@controllers/members/create-member.controller";
import { GetMemberByIdController } from "@/server/interface-adapters/controllers/members/get-member-by-id.controller";
import { UpdateMemberController } from "@/server/interface-adapters/controllers/members/update-member.controller";
import { DeleteMemberController } from "@/server/interface-adapters/controllers/members/delete-member.controller";

// --- Imports: Plans ---
import { PlansRepository } from "../infrastructure/persistence/repositories/plans.repository";
import { GetAllPlansUseCase } from "../application/use-cases/plans/get-all-plans.use-case";
import { CreatePlanUseCase } from "../application/use-cases/plans/create-plan.use-case";
import { GetAllPlansController } from "../interface-adapters/controllers/plans/get-all-plans.controller";
import { CreatePlanController } from "../interface-adapters/controllers/plans/create-plan.controller";
import { GetPlanByIdUseCase } from "@/server/application/use-cases/plans/get-plan-by-id.use-case";
import { UpdatePlanUseCase } from "@/server/application/use-cases/plans/update-plan.use-case";
import { DeletePlanUseCase } from "@/server/application/use-cases/plans/delete-plan.use-case";
import { GetPlanByIdController } from "@/server/interface-adapters/controllers/plans/get-plan-by-id.controller";
import { UpdatePlanController } from "@/server/interface-adapters/controllers/plans/update-plan.controller";
import { DeletePlanController } from "@/server/interface-adapters/controllers/plans/delete-plan.controller";

// --- Imports: Products ---
import { ProductsRepository } from "../infrastructure/persistence/repositories/products.repository";
import { GetAllProductsUseCase } from "../application/use-cases/products/get-all-products.use-case";
import { CreateProductUseCase } from "../application/use-cases/products/create-product.use-case";
import { GetAllProductsController } from "../interface-adapters/controllers/products/get-all-products.controller";
import { CreateProductController } from "../interface-adapters/controllers/products/create-product.controller";
import { GetProductByIdUseCase } from "@/server/application/use-cases/products/get-product-by-id.use-case";
import { UpdateProductUseCase } from "@/server/application/use-cases/products/update-product.use-case";
import { DeleteProductUseCase } from "@/server/application/use-cases/products/delete-product.use-case";
import { GetProductByIdController } from "@/server/interface-adapters/controllers/products/get-product-by-id.controller";
import { UpdateProductController } from "@/server/interface-adapters/controllers/products/update-product.controller";
import { DeleteProductController } from "@/server/interface-adapters/controllers/products/delete-product.controller";

// --- Imports: Memberships ---
import { MembershipsRepository } from "../infrastructure/persistence/repositories/memberships.repository";
import { GetAllMembershipsUseCase } from "../application/use-cases/memberships/get-all-memberships.use-case";
import { CreateMembershipUseCase } from "../application/use-cases/memberships/create-membership.use-case";
import { GetAllMembershipsController } from "../interface-adapters/controllers/memberships/get-all-memberships.controller";
import { CreateMembershipController } from "../interface-adapters/controllers/memberships/create-membership.controller";
import { GetMembershipByIdUseCase } from "@/server/application/use-cases/memberships/get-membership-by-id.use-case";
import { UpdateMembershipUseCase } from "@/server/application/use-cases/memberships/update-membership.use-case";
import { DeleteMembershipUseCase } from "@/server/application/use-cases/memberships/delete-membership.use-case";
import { GetMembershipByIdController } from "@/server/interface-adapters/controllers/memberships/get-membership-by-id.controller";
import { UpdateMembershipController } from "@/server/interface-adapters/controllers/memberships/update-membership.controller";
import { DeleteMembershipController } from "@/server/interface-adapters/controllers/memberships/delete-membership.controller";

// --- Imports: Users ---
import { UsersRepository } from "../infrastructure/persistence/repositories/users.repository";
import { GetAllUsersUseCase } from "../application/use-cases/users/get-all-users.use-case";
import { CreateUserUseCase } from "../application/use-cases/users/create-user.use-case";
import { GetAllUsersController } from "../interface-adapters/controllers/users/get-all-users.controller";
import { CreateUserController } from "../interface-adapters/controllers/users/create-user.controller";
import { GetUserByIdUseCase } from "../application/use-cases/users/get-user-by-id.use-case";
import { UpdateUserUseCase } from "../application/use-cases/users/update-user.use-case";
import { DeleteUserUseCase } from "../application/use-cases/users/delete-user.use-case";
import { GetUserByIdController } from "../interface-adapters/controllers/users/get-user-by-id.controller";
import { UpdateUserController } from "../interface-adapters/controllers/users/update-user.controller";
import { DeleteUserController } from "../interface-adapters/controllers/users/delete-user.controller";
import { ClerkAuthService } from "../infrastructure/services/clerk-auth.service";

// --- Imports: Dashboard ---
import { PrismaDashboardRepository } from "../infrastructure/persistence/repositories/dashboard.repository";
import { GetDashboardMetricsUseCase } from "../application/use-cases/dashboard/get-dashboard-metrics.use-case";
import { GetDashboardMetricsController } from "../interface-adapters/controllers/dashboard/get-dashboard-metrics.controller";

// Factory function "memoizada" por request
export const getContainer = cache(async () => {
  const { orgId } = await auth(); // Clerk cachea esto, no es doble llamada lenta

  // Si llegamos aquí, el middleware ya validó que orgId existe.
  const tenantId = orgId as string;

  // ===========================================================================
  // 1. ORGANIZATIONS
  // ===========================================================================
  // Repositories
  const organizationsRepository = new OrganizationsRepository(
    prisma.organization,
    tenantId,
  );

  // Use Cases
  const getAllOrganizationsUseCase = new GetAllOrganizationsUseCase(
    organizationsRepository,
  );
  const createOrganizationUseCase = new CreateOrganizationUseCase(
    organizationsRepository,
  );
  // Controllers
  const getAllOrganizationsController = new GetAllOrganizationsController(
    getAllOrganizationsUseCase,
  );
  const createOrganizationController = new CreateOrganizationController(
    createOrganizationUseCase,
  );
  const getOrganizationByIdController = new GetOrganizationByIdController(
    new GetOrganizationByIdUseCase(organizationsRepository),
  );
  const getOrganizationController = new GetOrganizationController(
    new GetOrganizationUseCase(organizationsRepository),
  );
  const updateOrganizationController = new UpdateOrganizationController(
    new UpdateOrganizationUseCase(organizationsRepository),
  );
  const deleteOrganizationController = new DeleteOrganizationController(
    new DeleteOrganizationUseCase(organizationsRepository),
  );
  const updateOrganizationSettingsController = new UpdateOrganizationSettingsController(
    new UpdateOrganizationSettingsUseCase(),
  );

  // ===========================================================================
  // 2. MEMBERS
  // ===========================================================================
  // Repo
  const membersRepository = new MembersRepository(prisma.member, tenantId);
  // Use Cases
  const getAllMembersUseCase = new GetAllMembersUseCase(membersRepository);
  const createMemberUseCase = new CreateMemberUseCase(membersRepository);
  const getMemberByIdUseCase = new GetMemberByIdUseCase(membersRepository);
  const updateMemberUseCase = new UpdateMemberUseCase(membersRepository);
  const deleteMemberUseCase = new DeleteMemberUseCase(membersRepository);
  // Controllers
  const getAllMembersController = new GetAllMembersController(
    getAllMembersUseCase,
  );
  const createMemberController = new CreateMemberController(
    createMemberUseCase,
  );
  const getMemberByIdController = new GetMemberByIdController(
    getMemberByIdUseCase,
  );
  const updateMemberController = new UpdateMemberController(
    updateMemberUseCase,
  );
  const deleteMemberController = new DeleteMemberController(
    deleteMemberUseCase,
  );

  // ===========================================================================
  // 3. PLANS
  // ===========================================================================
  // Repo
  const plansRepository = new PlansRepository(prisma.plan, tenantId);
  // Use Cases
  const getAllPlansUseCase = new GetAllPlansUseCase(plansRepository);
  const createPlanUseCase = new CreatePlanUseCase(plansRepository);
  // Controllers
  const getAllPlansController = new GetAllPlansController(getAllPlansUseCase);
  const createPlanController = new CreatePlanController(createPlanUseCase);
  const getPlanByIdController = new GetPlanByIdController(
    new GetPlanByIdUseCase(plansRepository),
  );
  const updatePlanController = new UpdatePlanController(
    new UpdatePlanUseCase(plansRepository),
  );
  const deletePlanController = new DeletePlanController(
    new DeletePlanUseCase(plansRepository),
  );

  // ===========================================================================
  // 4. PRODUCTS
  // ===========================================================================
  // Repo
  const productsRepository = new ProductsRepository(prisma.product, tenantId);
  // Use Cases
  const getAllProductsUseCase = new GetAllProductsUseCase(productsRepository);
  const createProductUseCase = new CreateProductUseCase(productsRepository);
  // Controllers
  const getAllProductsController = new GetAllProductsController(
    getAllProductsUseCase,
  );
  const createProductController = new CreateProductController(
    createProductUseCase,
  );
  const getProductByIdController = new GetProductByIdController(
    new GetProductByIdUseCase(productsRepository),
  );
  const updateProductController = new UpdateProductController(
    new UpdateProductUseCase(productsRepository),
  );
  const deleteProductController = new DeleteProductController(
    new DeleteProductUseCase(productsRepository),
  );

  // ===========================================================================
  // 5. MEMBERSHIPS
  // ===========================================================================
  // Repo
  const membershipsRepository = new MembershipsRepository(prisma, tenantId);
  // Use Cases
  const getAllMembershipsUseCase = new GetAllMembershipsUseCase(
    membershipsRepository,
  );
  const createMembershipUseCase = new CreateMembershipUseCase(
    membershipsRepository,
  );
  // Controllers
  const getAllMembershipsController = new GetAllMembershipsController(
    getAllMembershipsUseCase,
  );
  const createMembershipController = new CreateMembershipController(
    createMembershipUseCase,
  );
  const getMembershipByIdController = new GetMembershipByIdController(
    new GetMembershipByIdUseCase(membershipsRepository),
  );
  const updateMembershipController = new UpdateMembershipController(
    new UpdateMembershipUseCase(membershipsRepository),
  );
  const deleteMembershipController = new DeleteMembershipController(
    new DeleteMembershipUseCase(membershipsRepository),
  );

  // ===========================================================================
  // 6. USERS
  // ===========================================================================
  // Repo
  const usersRepository = new UsersRepository(prisma.user, tenantId);
  // Services
  const clerkAuthService = new ClerkAuthService();

  // Use Cases
  const getAllUsersUseCase = new GetAllUsersUseCase(usersRepository);
  const createUserUseCase = new CreateUserUseCase(usersRepository, clerkAuthService);
  const getUserByIdUseCase = new GetUserByIdUseCase(usersRepository);
  const updateUserUseCase = new UpdateUserUseCase(usersRepository);
  const deleteUserUseCase = new DeleteUserUseCase(usersRepository);
  // Controllers
  const getAllUsersController = new GetAllUsersController(getAllUsersUseCase);
  const createUserController = new CreateUserController(createUserUseCase);
  const getUserByIdController = new GetUserByIdController(getUserByIdUseCase);
  const updateUserController = new UpdateUserController(updateUserUseCase);
  const deleteUserController = new DeleteUserController(deleteUserUseCase);

  // ===========================================================================
  // 7. DASHBOARD
  // ===========================================================================
  // Repo
  const dashboardRepository = new PrismaDashboardRepository(prisma, tenantId);
  // Use Case
  const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(dashboardRepository);
  // Controller
  const getDashboardMetricsController = new GetDashboardMetricsController(getDashboardMetricsUseCase);

  // ===========================================================================
  // RETURN
  // ===========================================================================
  return {
    // Organizations
    getAllOrganizationsController,
    createOrganizationController,
    getOrganizationByIdController,
    getOrganizationController,
    updateOrganizationController,
    deleteOrganizationController,
    updateOrganizationSettingsController,
    // Members
    getAllMembersController,
    createMemberController,
    getMemberByIdController,
    updateMemberController,
    deleteMemberController,
    // Plans
    getAllPlansController,
    createPlanController,
    getPlanByIdController,
    updatePlanController,
    deletePlanController,
    // Products
    getAllProductsController,
    createProductController,
    getProductByIdController,
    updateProductController,
    deleteProductController,
    // Memberships
    getAllMembershipsController,
    createMembershipController,
    getMembershipByIdController,
    updateMembershipController,
    deleteMembershipController,
    // Users
    getAllUsersController,
    createUserController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
    // Dashboard
    getDashboardMetricsController,
  };
});
