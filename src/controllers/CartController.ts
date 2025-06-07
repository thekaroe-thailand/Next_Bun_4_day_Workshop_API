import type { CartInterface } from "../interface/CartInterface";
import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

export const CartController = {
    add: async ({ body }: { body: CartInterface }) => {
        try {
            const cart = await prisma.cart.findFirst({
                where: {
                    memberId: body.memberId,
                    bookId: body.bookId
                }
            })

            if (cart != null) {
                await prisma.cart.update({
                    where: {
                        id: cart.id
                    },
                    data: {
                        qty: cart.qty + 1
                    }
                })
            } else {
                await prisma.cart.create({
                    data: {
                        memberId: body.memberId,
                        bookId: body.bookId,
                        qty: 1
                    }
                })
            }
        } catch (err) {
            return { error: err }
        }
    },
    list: async ({ params }: {
        params: {
            memberId: string
        }
    }) => {
        try {
            return await prisma.cart.findMany({
                where: {
                    memberId: params.memberId
                },
                select: {
                    id: true,
                    qty: true,
                    book: true
                }
            })
        } catch (err) {
            return { error: err }
        }
    },
    delete: async ({ params }: {
        params: {
            id: string
        }
    }) => {
        try {
            await prisma.cart.delete({
                where: {
                    id: params.id
                }
            })
            return { message: 'success' }
        } catch (err) {
            return { error: err }
        }
    },
    upQty: async ({ params }: {
        params: {
            id: string
        }
    }) => {
        try {
            const cart = await prisma.cart.findUnique({
                where: {
                    id: params.id
                }
            })

            if (cart) {
                return await prisma.cart.update({
                    data: {
                        qty: cart.qty + 1
                    },
                    where: {
                        id: params.id
                    }
                })
            }
        } catch (err) {
            return { error: err }
        }
    },
    downQty: async ({ params, set }: {
        params: {
            id: string
        },
        set: {
            status: number
        }
    }) => {
        try {
            const cart = await prisma.cart.findUnique({
                where: {
                    id: params.id
                }
            })

            if (cart) {
                if (cart.qty - 1 < 1) {
                    set.status = 400;
                    return { message: 'qty < 1' }
                }

                return await prisma.cart.update({
                    data: {
                        qty: cart.qty - 1
                    },
                    where: {
                        id: params.id
                    }
                })
            }
        } catch (err) {
            set.status = 500;
            return err;
        }
    },
    cartConfirm: async ({ body, jwt, request, set }: {
        body: {
            name: string,
            address: string,
            phone: string
        },
        jwt: any,
        request: any,
        set: {
            status: number
        }
    }) => {
        try {
            const token = request.headers.get('Authorization').replace('Bearer ', '');
            const payload = await jwt.verify(token);

            await prisma.member.update({
                data: {
                    phone: body.phone,
                    name: body.name,
                    address: body.address
                },
                where: {
                    id: payload.id
                }
            })

            return { message: 'success' }
        } catch (err) {
            set.status = 500;
            return err;
        }
    },
    uploadSlip: async ({ body }: {
        body: {
            myFile: File
        }
    }) => {
        const path = 'public/upload/slip/' + body.myFile.name;
        Bun.write(path, body.myFile);
    },
    confirmOrder: async ({ jwt, request, set, body }: {
        jwt: any,
        request: any,
        set: {
            status: number
        },
        body: {
            slipName: string
        }
    }) => {
        try {
            const token = request.headers.get('Authorization').replace('Bearer ', '');
            const payload = await jwt.verify(token);
            const memberId = payload.id;
            const carts = await prisma.cart.findMany({
                where: {
                    memberId: memberId
                },
                select: {
                    qty: true,
                    book: true
                }
            });
            const member = await prisma.member.findUnique({
                where: {
                    id: memberId
                }
            })

            if (!member) {
                set.status = 401;
                return { message: 'unauthorized' }
            }

            if (member) {
                const order = await prisma.order.create({
                    data: {
                        createdAt: new Date(),
                        trackCode: '',
                        customerName: member.name ?? '',
                        customerAddress: member.address ?? '',
                        customerPhone: member.phone ?? '',
                        memberId: member.id,
                        slipImage: body.slipName
                    }
                });

                for (let i = 0; i < carts.length; i++) {
                    const cart = carts[i];

                    await prisma.orderDetail.create({
                        data: {
                            price: cart.book.price,
                            qty: cart.qty,
                            bookId: cart.book.id,
                            orderId: order.id
                        }
                    })
                }

                await prisma.cart.deleteMany({
                    where: {
                        memberId: memberId
                    }
                })

                return { message: 'success' }
            }
        } catch (err) {
            set.status = 500;
            return err;
        }
    }
}