import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

export const OrderController = {
    list: async ({ set }: { set: any }) => {
        try {
            return prisma.order.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    OrderDetail: {
                        select: {
                            id: true,
                            qty: true,
                            price: true,
                            Book: {
                                select: {
                                    isbn: true,
                                    name: true
                                }
                            }
                        }
                    },
                    createdAt: true,
                    id: true,
                    customerName: true,
                    customerAddress: true,
                    customerPhone: true,
                    status: true
                }
            })
        } catch (err) {
            set.status = 500;
            return err;
        }
    }
}