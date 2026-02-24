import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import { prisma } from "../infrastructure/persistence/prisma";
import type { Role } from "@/shared/types/permissions.types";
import { createAttendanceModule } from "./modules/attendances.module";
import { createDashboardModule } from "./modules/dashboard.module";
import { createMembersModule } from "./modules/members.module";
import { createMembershipsModule } from "./modules/memberships.module";
import { createOrganizationsModule } from "./modules/organizations.module";
import { createPlansModule } from "./modules/plans.module";
import { createProductsModule } from "./modules/products.module";
import { createSystemModule } from "./modules/system.module";
import { createUsersModule } from "./modules/users.module";
import { createAuthModule } from "./modules/auth.module";
import { MembersRepository } from "@/server/infrastructure/persistence/repositories/members.repository";
import { UsersRepository } from "@/server/infrastructure/persistence/repositories/users.repository";
import { OrganizationsRepository } from "@/server/infrastructure/persistence/repositories/organizations.repository";
import { UnauthorizedError } from "@/server/domain/errors/common";

export const getContainer = cache(async () => {
  const { orgId, userId } = await auth();


  const tenantId = orgId ?? "";

  if (!userId) {
    throw new UnauthorizedError('Se requiere autenticación')
  }

  const dbUser = await prisma.user.findFirst({
    where: { id: userId, organizationId: tenantId },
    select: { role: true },
  })

  if (!dbUser) {
    throw new UnauthorizedError('Usuario no encontrado en esta organización')
  }

  const userRole = dbUser.role as Role

  const organizationsRepo = new OrganizationsRepository(prisma.organization, tenantId)
  const membersRepo = new MembersRepository(prisma.member, tenantId)
  const usersRepo = new UsersRepository(prisma.user, tenantId)

  const authModule = createAuthModule(
    organizationsRepo,
    membersRepo,
    usersRepo,
    userRole,
    tenantId,
  )

  const attendanceModule = createAttendanceModule(prisma, tenantId, authModule);
  const dashboardModule = createDashboardModule(prisma, tenantId, authModule);
  const membersModule = createMembersModule(prisma, tenantId, authModule);
  const membershipsModule = createMembershipsModule(prisma, tenantId, authModule);
  const organizationsModule = createOrganizationsModule(prisma, tenantId, authModule);
  const plansModule = createPlansModule(prisma, tenantId, authModule);
  const productsModule = createProductsModule(prisma, tenantId, authModule);
  const usersModule = createUsersModule(prisma, tenantId, userId, authModule);
  const systemModule = createSystemModule();

  return {

    // Attendances
    getAllAttendancesController: attendanceModule.getAllAttendancesController,
    getAttendanceByIdController: attendanceModule.getAttendanceByIdController,
    registerAttendanceController: attendanceModule.registerAttendanceController,
    updateAttendanceController: attendanceModule.updateAttendanceController,
    deleteAttendanceController: attendanceModule.deleteAttendanceController,

    // Dashboard
    getDashboardMetricsController: dashboardModule.getDashboardMetricsController,
    getHistoricStartDateController: dashboardModule.getHistoricStartDateController,

    // Members
    getAllMembersController: membersModule.getAllMembersController,
    createMemberController: membersModule.createMemberController,
    getMemberByIdController: membersModule.getMemberByIdController,
    updateMemberController: membersModule.updateMemberController,
    deleteMemberController: membersModule.deleteMemberController,
    restoreMemberController: membersModule.restoreMemberController,
    getMemberByQrCodeController: membersModule.getMemberByQrCodeController,

    // Memberships
    getAllMembershipsController: membershipsModule.getAllMembershipsController,
    createMembershipController: membershipsModule.createMembershipController,
    getMembershipByIdController: membershipsModule.getMembershipByIdController,
    updateMembershipController: membershipsModule.updateMembershipController,
    deleteMembershipController: membershipsModule.deleteMembershipController,
    restoreMembershipController: membershipsModule.restoreMembershipController,
    cancelMembershipController: membershipsModule.cancelMembershipController,

    // Organizations
    getAllOrganizationsController: organizationsModule.getAllOrganizationsController,
    createOrganizationController: organizationsModule.createOrganizationController,
    getOrganizationByIdController: organizationsModule.getOrganizationByIdController,
    getOrganizationController: organizationsModule.getOrganizationController,
    updateOrganizationController: organizationsModule.updateOrganizationController,
    deleteOrganizationController: organizationsModule.deleteOrganizationController,
    updateOrganizationSettingsController: organizationsModule.updateOrganizationSettingsController,
    upgradeOrganizationPlanController: organizationsModule.upgradeOrganizationPlanController,
    createCheckoutSessionController: organizationsModule.createCheckoutSessionController,
    getOrganizationBySlugController: organizationsModule.getOrganizationBySlugController,

    // Plans
    getAllPlansController: plansModule.getAllPlansController,
    createPlanController: plansModule.createPlanController,
    getPlanByIdController: plansModule.getPlanByIdController,
    updatePlanController: plansModule.updatePlanController,
    deletePlanController: plansModule.deletePlanController,
    restorePlanController: plansModule.restorePlanController,

    // Products
    getAllProductsController: productsModule.getAllProductsController,
    createProductController: productsModule.createProductController,
    getProductByIdController: productsModule.getProductByIdController,
    updateProductController: productsModule.updateProductController,
    deleteProductController: productsModule.deleteProductController,
    restoreProductController: productsModule.restoreProductController,

    // Users
    getAllUsersController: usersModule.getAllUsersController,
    createUserController: usersModule.createUserController,
    getUserByIdController: usersModule.getUserByIdController,
    updateUserController: usersModule.updateUserController,
    deleteUserController: usersModule.deleteUserController,
    restoreUserController: usersModule.restoreUserController,

    // System
    getSystemStatsController: systemModule.getSystemStatsController,
    getAllOrganizationsSystemController: systemModule.getAllOrganizationsSystemController,
    suspendOrganizationController: systemModule.suspendOrganizationController,
    getRecentSignupsController: systemModule.getRecentSignupsController,
    getRevenueStatsController: systemModule.getRevenueStatsController,
    getSystemConfigController: systemModule.getSystemConfigController,
    updateSystemConfigController: systemModule.updateSystemConfigController,
    getSystemPlansController: systemModule.getSystemPlansController,
    createSystemPlanController: systemModule.createSystemPlanController,
    updateSystemPlanController: systemModule.updateSystemPlanController,

  };

});
import { createClerkWebhookModule } from "./modules/clerk-webhook.module";
import { createStripeWebhookModule } from "./modules/stripe-webhook.module";

// Factory for webhook events running without user session
export const getClerkWebhookContainer = cache(async () => {
  const clerkWebhookModule = createClerkWebhookModule(prisma);
  return clerkWebhookModule;
});

// Factory for stripe webhook events running without user session
export const getStripeWebhookContainer = cache(async () => {
  const stripeWebhookModule = createStripeWebhookModule(prisma);
  return stripeWebhookModule;
});
