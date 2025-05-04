import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

import type { BookInterface } from "../interface/BookInterface";

export const BookController = {
    create: async ({body}: { body: BookInterface }) => {
        try {
            const book = await prisma.book.create({
                data: {
                    name: body.name,
                    price: body.price
                }
            })

            return book
        } catch (err) {
            console.log(err);
            return { error: err }
        }
    },
    list: async () => {
        try {
            return await prisma.book.findMany();
        } catch (err) {
            console.log(err);
            return err;
        }
    },
    update: async ({params, body}: {
        params: {
            id:string
        },
        body: BookInterface
    }) => {
        try {
            const book = await prisma.book.update({
                data: {
                    name: body.name,
                    price: body.price
                },
                where: {
                    id: params.id
                }
            });

            return book;
        } catch (err) {
            return err;
        }
    },
    delete: async ({ params }: { 
        params: { 
            id: string 
        }
    }) => {
        try {
            await prisma.book.delete({
                where: {
                    id: params.id
                }
            })

            return { message: 'success'}
        } catch (error) {
            return {error: error}
        }
    }
}
