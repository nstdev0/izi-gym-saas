import { NextResponse } from 'next/server';
import { prisma } from '@/server/infrastructure/persistence/prisma';

export async function GET() {
    try {
        const freePlan = await prisma.organizationPlan.findUnique({ where: { slug: 'free-trial' } });
        return NextResponse.json({ freePlan });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack });
    }
}
