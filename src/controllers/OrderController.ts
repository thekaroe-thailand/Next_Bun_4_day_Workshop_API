import { PrismaClient } from '../generated/prisma-client'
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
                    status: true,
                    slipImage: true,
                    trackCode: true,
                    express: true,
                    remark: true
                }
            })
        } catch (err) {
            set.status = 500;
            return err;
        }
    },
    cancel: async ({ set, params }: {
        set: any,
        params: {
            id: string
        }
    }) => {
        try {
            await prisma.order.update({
                data: {
                    status: 'cancel'
                },
                where: {
                    id: params.id
                }
            })
        } catch (err) {
            set.status = 500;
            return err;
        }
    },
    paid: async ({ set, params }: {
        set: any,
        params: {
            id: string
        }
    }) => {
        try {
            await prisma.order.update({
                data: {
                    status: 'paid'
                },
                where: {
                    id: params.id
                }
            })
        } catch (err) {
            set.status = 500;
            return err;
        }
    },
    send: async ({ set, body }: {
        set: {
            status: number
        },
        body: {
            traceCode: string,
            express: string,
            remark: string,
            orderId: string
        }
    }) => {
        try {
            await prisma.order.update({
                where: {
                    id: body.orderId
                },
                data: {
                    trackCode: body.traceCode,
                    express: body.express,
                    remark: body.remark,
                    status: 'send'
                }
            })
        } catch (err) {
            set.status = 500;
            return err;
        }
    }
}