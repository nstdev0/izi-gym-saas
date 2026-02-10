import { PrismaClient } from './generated/prisma'; const prisma = new PrismaClient(); prisma.organization.findFirst().then(org => console.log('SLUG:', org?.slug)).finally(() => prisma.$disconnect());
