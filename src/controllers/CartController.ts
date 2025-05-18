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
    }
}