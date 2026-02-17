import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../infrastructure/persistence/prisma";

import { createOrganizationsModule } from "./modules/organizations.module";
import { createMembersModule } from "./modules/members.module";
import { createPlansModule } from "./modules/plans.module";
import { createProductsModule } from "./modules/products.module";
import { createMembershipsModule } from "./modules/memberships.module";
import { createUsersModule } from "./modules/users.module";
import { createDashboardModule } from "./modules/dashboard.module";
import { createAttendanceModule } from "./modules/attendances.module";
import { createSystemModule } from "./modules/system.module";

// Factory function "memoizada" por request
export const getContainer = cache(async () => {
  const { orgId } = await auth(); // Clerk cachea esto, no es doble llamada lenta

  // Si llegamos aquí, el middleware ya validó que orgId existe.
  const tenantId = orgId as string;

  // 1. ORGANIZATIONS
  const organizationsModule = createOrganizationsModule(prisma, tenantId);

  // 2. MEMBERS
  const membersModule = createMembersModule(prisma, tenantId);

  // 3. PLANS
  const plansModule = createPlansModule(prisma, tenantId);

  // 4. PRODUCTS
  const productsModule = createProductsModule(prisma, tenantId);

  // 5. MEMBERSHIPS
  const membershipsModule = createMembershipsModule(prisma, tenantId);

  // 6. USERS
  const usersModule = createUsersModule(prisma, tenantId);

  // 7. DASHBOARD
  const dashboardModule = createDashboardModule(prisma, tenantId);

  // 9. ATTENDANCE
  const attendanceModule = createAttendanceModule(prisma, tenantId);

  // 8. SYSTEM (GOD MODE)
  const systemModule = createSystemModule();

  return {
    // Organizations
    getAllOrganizationsController: organizationsModule.getAllOrganizationsController,
    createOrganizationController: organizationsModule.createOrganizationController,
    getOrganizationByIdController: organizationsModule.getOrganizationByIdController,
    getOrganizationController: organizationsModule.getOrganizationController,
    updateOrganizationController: organizationsModule.updateOrganizationController,
    deleteOrganizationController: organizationsModule.deleteOrganizationController,
    updateOrganizationSettingsController: organizationsModule.updateOrganizationSettingsController,
    upgradeOrganizationPlanController: organizationsModule.upgradeOrganizationPlanController,

    // Members
    getAllMembersController: membersModule.getAllMembersController,
    createMemberController: membersModule.createMemberController,
    getMemberByIdController: membersModule.getMemberByIdController,
    updateMemberController: membersModule.updateMemberController,
    deleteMemberController: membersModule.deleteMemberController,
    restoreMemberController: membersModule.restoreMemberController,
    getMemberByQrCodeController: membersModule.getMemberByQrCodeController,

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

    // Memberships
    getAllMembershipsController: membershipsModule.getAllMembershipsController,
    createMembershipController: membershipsModule.createMembershipController,
    getMembershipByIdController: membershipsModule.getMembershipByIdController,
    updateMembershipController: membershipsModule.updateMembershipController,
    deleteMembershipController: membershipsModule.deleteMembershipController,
    restoreMembershipController: membershipsModule.restoreMembershipController,
    cancelMembershipController: membershipsModule.cancelMembershipController,

    // Users
    getAllUsersController: usersModule.getAllUsersController,
    createUserController: usersModule.createUserController,
    getUserByIdController: usersModule.getUserByIdController,
    updateUserController: usersModule.updateUserController,
    deleteUserController: usersModule.deleteUserController,
    restoreUserController: usersModule.restoreUserController,

    // Dashboard
    getDashboardMetricsController: dashboardModule.getDashboardMetricsController,
    getHistoricStartDateController: dashboardModule.getHistoricStartDateController,

    // Attendance
    registerAttendanceController: attendanceModule.registerAttendanceController,
    getAllAttendancesController: attendanceModule.getAllAttendancesController,
    getAttendanceByIdController: attendanceModule.getAttendanceByIdController,
    updateAttendanceController: attendanceModule.updateAttendanceController,
    deleteAttendanceController: attendanceModule.deleteAttendanceController,

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
