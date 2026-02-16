import { PrismaClient } from "@/generated/prisma/client";

export class TransactionManager {
    constructor(private prisma: PrismaClient) {

    }

    async run<T>(callback: (tx: any) => Promise<T>): Promise<T> {
        return this.prisma.$transaction(async (tx) => {
            return await callback(tx);
        });
    }
}

export type ITransactionManager = InstanceType<typeof TransactionManager>;