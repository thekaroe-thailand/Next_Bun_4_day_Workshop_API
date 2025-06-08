import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

export const DashboardController = {
    list: async ({ set }: {
        set: {
            status: number
        }
    }) => {
        try {
            // totalOrder
            const totalOrder = await prisma.order.count();

            // totalIncome
            const orders = await prisma.order.findMany({
                where: {
                    status: {
                        not: 'cancel'
                    }
                }
            });

            let totalIncome = 0;

            for (let i = 0; i < orders.length; i++) {
                const orderDetails = await prisma.orderDetail.findMany({
                    where: {
                        orderId: orders[i].id
                    }
                })
                for (let j = 0; j < orderDetails.length; j++) {
                    const orderDetail = orderDetails[j];
                    const price = orderDetail.price;
                    const qty = orderDetail.qty;
                    const amount = qty * price;

                    totalIncome += amount;
                }
            }

            // totalMember
            const totalMember = await prisma.member.count();

            return {
                totalOrder: totalOrder,
                totalIncome: totalIncome,
                totalMember: totalMember
            }
        } catch (err) {
            set.status = 500;
            return err;
        }
    }
}