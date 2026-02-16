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
import { UpgradeOrganizationPlanController } from "@/server/interface-adapters/controllers/organizations/upgrade-organization-plan.controller";
import { UpgradeOrganizationPlanUseCase } from "@/server/application/use-cases/organizations/upgrade-organization-plan.use-case";

// --- Imports: Members ---
import { MembersRepository } from "@persistence/repositories/members.repository";
import { GetAllMembersUseCase } from "@use-cases/members/get-all-members.use-case";
import { CreateMemberUseCase } from "@use-cases/members/create-member.use-case";
import { GetMemberByIdUseCase } from "@/server/application/use-cases/members/get-member-by-id.use-case";
import { UpdateMemberUseCase } from "@/server/application/use-cases/members/update-member.use-case";
import { DeleteMemberUseCase } from "@/server/application/use-cases/members/delete-member.use-case";
import { RestoreMemberUseCase } from "@/server/application/use-cases/members/restore-member.use-case";
import { GetAllMembersController } from "@controllers/members/get-all-members.controller";
import { CreateMemberController } from "@controllers/members/create-member.controller";
import { GetMemberByIdController } from "@/server/interface-adapters/controllers/members/get-member-by-id.controller";
import { UpdateMemberController } from "@/server/interface-adapters/controllers/members/update-member.controller";
import { DeleteMemberController } from "@/server/interface-adapters/controllers/members/delete-member.controller";
import { RestoreMemberController } from "@/server/interface-adapters/controllers/members/restore-member.controller";

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
import { GetHistoricStartDateUseCase } from "../application/use-cases/dashboard/get-historic-start-date.use-case";
import { GetHistoricStartDateController } from "../interface-adapters/controllers/dashboard/get-historic-start-date.controller";

// --- Imports: Attendance ---
import { AttendanceRepository } from "../infrastructure/persistence/repositories/attendance.repository";
import { RegisterAttendanceUseCase } from "../application/use-cases/attendance/register-attendance.use-case";
import { RegisterAttendanceController } from "../interface-adapters/controllers/attendance/register-attendance.controller";
import { GetAllAttendancesUseCase } from "../application/use-cases/attendance/get-all-attendances.use-case";
import { GetAttendanceByIdUseCase } from "../application/use-cases/attendance/get-attendance-by-id.use-case";
import { UpdateAttendanceUseCase } from "../application/use-cases/attendance/update-attendance.use-case";
import { DeleteAttendanceUseCase } from "../application/use-cases/attendance/delete-attendance.use-case";
import { GetAllAttendancesController } from "../interface-adapters/controllers/attendance/get-all-attendances.controller";
import { GetAttendanceByIdController } from "../interface-adapters/controllers/attendance/get-attendance-by-id.controller";
import { UpdateAttendanceController } from "../interface-adapters/controllers/attendance/update-attendance.controller";
import { DeleteAttendanceController } from "../interface-adapters/controllers/attendance/delete-attendance.controller";

// --- Imports: System ---
import { SystemRepository } from "../infrastructure/persistence/repositories/system.repository";
import { SystemGetSystemStatsUseCase } from "../application/use-cases/system/system-get-system-stats.use-case";
import { SystemGetAllOrganizationsUseCase } from "../application/use-cases/system/system-get-all-organizations.use-case";
import { SystemSuspendOrganizationUseCase } from "../application/use-cases/system/system-suspend-organization.use-case";
import { SystemGetSystemStatsController } from "../interface-adapters/controllers/system/system-get-system-stats.controller";
import { SystemGetAllOrganizationsController } from "../interface-adapters/controllers/system/system-get-all-organizations.controller";
import { SystemSuspendOrganizationController } from "../interface-adapters/controllers/system/system-suspend-organization.controller";
import { SystemGetRecentSignupsUseCase } from "../application/use-cases/system/system-get-recent-signups.use-case";
import { SystemGetRevenueStatsUseCase } from "../application/use-cases/system/system-get-revenue-stats.use-case";
import { SystemGetSystemConfigUseCase } from "../application/use-cases/system/system-get-system-config.use-case";
import { SystemUpdateSystemConfigUseCase } from "../application/use-cases/system/system-update-system-config.use-case";
import { SystemGetRecentSignupsController } from "../interface-adapters/controllers/system/system-get-recent-signups.controller";
import { SystemGetRevenueStatsController } from "../interface-adapters/controllers/system/system-get-revenue-stats.controller";
import { SystemGetSystemConfigController } from "../interface-adapters/controllers/system/system-get-system-config.controller";
import { SystemGetPlansController } from "../interface-adapters/controllers/system/system-get-plans.controller";
import { SystemCreatePlanController } from "../interface-adapters/controllers/system/system-create-plan.controller";
import { SystemUpdateSystemConfigController } from "../interface-adapters/controllers/system/update-system-config.controller";
import { SystemUpdatePlanController } from "../interface-adapters/controllers/system/update-plan.controller";
import { SystemUpdatePlanUseCase } from "../application/use-cases/system/system-update-plan.use-case";
import { SystemCreatePlanUseCase } from "../application/use-cases/system/system-create-plan.use-case";
import { SystemGetPlansUseCase } from "../application/use-cases/system/system-get-plans.use-case";
import { GetMemberByQrCodeController } from "../interface-adapters/controllers/members/get-member-by-qr-code.controller";
import { GetMemberByQrCodeUseCase } from "../application/use-cases/members/get-member-by-qr.use-case";
import { TransactionManager } from "../infrastructure/persistence/repositories/transaction-manager";
import { OrganizationMapper } from "../infrastructure/persistence/mappers/organizations.mapper";


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
    prisma,
    new OrganizationMapper()
  );
  const upgradeOrganizationPlanUseCase = new UpgradeOrganizationPlanUseCase(
    prisma,
    new OrganizationMapper(),
    tenantId
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
  const upgradeOrganizationPlanController = new UpgradeOrganizationPlanController(
    upgradeOrganizationPlanUseCase,
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
  const restoreMemberUseCase = new RestoreMemberUseCase(membersRepository);
  const getMemberByQrCodeUseCase = new GetMemberByQrCodeUseCase(membersRepository);
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
  const restoreMemberController = new RestoreMemberController(
    restoreMemberUseCase,
  );
  const getMemberByQrCodeController = new GetMemberByQrCodeController(
    getMemberByQrCodeUseCase,
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
  const membershipsRepository = new MembershipsRepository(
    prisma.membership,
    tenantId,
  );
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
  const getHistoricStartDateUseCase = new GetHistoricStartDateUseCase(dashboardRepository);
  // Controller
  const getDashboardMetricsController = new GetDashboardMetricsController(getDashboardMetricsUseCase);
  const getHistoricStartDateController = new GetHistoricStartDateController(getHistoricStartDateUseCase);

  // ===========================================================================
  // 9. ATTENDANCE
  // ===========================================================================
  // Repo
  const attendanceRepository = new AttendanceRepository(prisma.attendance, tenantId);
  // Use Cases
  const registerAttendanceUseCase = new RegisterAttendanceUseCase(attendanceRepository, membersRepository);
  const getAllAttendancesUseCase = new GetAllAttendancesUseCase(attendanceRepository);
  const getAttendanceByIdUseCase = new GetAttendanceByIdUseCase(attendanceRepository);
  const updateAttendanceUseCase = new UpdateAttendanceUseCase(attendanceRepository);
  const deleteAttendanceUseCase = new DeleteAttendanceUseCase(attendanceRepository);
  // Controllers
  const registerAttendanceController = new RegisterAttendanceController(registerAttendanceUseCase);
  const getAllAttendancesController = new GetAllAttendancesController(getAllAttendancesUseCase);
  const getAttendanceByIdController = new GetAttendanceByIdController(getAttendanceByIdUseCase);
  const updateAttendanceController = new UpdateAttendanceController(updateAttendanceUseCase);
  const deleteAttendanceController = new DeleteAttendanceController(deleteAttendanceUseCase);

  // ===========================================================================
  // 8. SYSTEM (GOD MODE)
  // ===========================================================================
  // Repo
  const systemRepository = new SystemRepository();
  // Use Cases
  const getSystemStatsUseCase = new SystemGetSystemStatsUseCase(systemRepository);
  const getAllOrganizationsSystemUseCase = new SystemGetAllOrganizationsUseCase(systemRepository);
  const suspendOrganizationUseCase = new SystemSuspendOrganizationUseCase(systemRepository);
  // Controllers
  const getSystemStatsController = new SystemGetSystemStatsController(getSystemStatsUseCase);
  const getAllOrganizationsSystemController = new SystemGetAllOrganizationsController(getAllOrganizationsSystemUseCase);
  const suspendOrganizationController = new SystemSuspendOrganizationController(suspendOrganizationUseCase);

  const getRecentSignupsUseCase = new SystemGetRecentSignupsUseCase(systemRepository);
  const getRecentSignupsController = new SystemGetRecentSignupsController(getRecentSignupsUseCase);

  const getRevenueStatsUseCase = new SystemGetRevenueStatsUseCase(systemRepository);
  const getRevenueStatsController = new SystemGetRevenueStatsController(getRevenueStatsUseCase);

  const getSystemConfigUseCase = new SystemGetSystemConfigUseCase(systemRepository);
  const getSystemConfigController = new SystemGetSystemConfigController(getSystemConfigUseCase);

  const updateSystemConfigUseCase = new SystemUpdateSystemConfigUseCase(systemRepository);
  const updateSystemConfigController = new SystemUpdateSystemConfigController(updateSystemConfigUseCase);

  const getSystemPlansUseCase = new SystemGetPlansUseCase(systemRepository);
  const getSystemPlansController = new SystemGetPlansController(getSystemPlansUseCase);

  const createSystemPlanUseCase = new SystemCreatePlanUseCase(systemRepository);
  const createSystemPlanController = new SystemCreatePlanController(createSystemPlanUseCase);

  const updateSystemPlanUseCase = new SystemUpdatePlanUseCase(systemRepository);
  const updateSystemPlanController = new SystemUpdatePlanController(updateSystemPlanUseCase);

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
    upgradeOrganizationPlanController,
    // Members
    getAllMembersController,
    createMemberController,
    getMemberByIdController,
    updateMemberController,
    deleteMemberController,
    restoreMemberController,
    getMemberByQrCodeController,
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
    getHistoricStartDateController,

    // Attendance
    registerAttendanceController,
    getAllAttendancesController,
    getAttendanceByIdController,
    updateAttendanceController,
    deleteAttendanceController,

    // System
    getSystemStatsController,
    getAllOrganizationsSystemController,
    suspendOrganizationController,
    getRecentSignupsController,
    getRevenueStatsController,
    getSystemConfigController,
    updateSystemConfigController,
    getSystemPlansController,
    createSystemPlanController,
    updateSystemPlanController,
  };
});
