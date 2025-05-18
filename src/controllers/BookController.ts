import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

import type { BookInterface } from "../interface/BookInterface";

export const BookController = {
    create: async ({ body }: { body: BookInterface }) => {
        try {
            const imageName = body.image.name;
            const image = body.image;
            const book = await prisma.book.create({
                data: {
                    name: body.name,
                    price: parseInt(body.price.toString()),
                    isbn: body.isbn,
                    description: body.description,
                    image: imageName
                }
            })

            Bun.write('public/uploads/' + imageName, image);

            return book
        } catch (err) {
            console.log(err);
            return { error: err }
        }
    },
    list: async () => {
        try {
            return await prisma.book.findMany({
                orderBy: {
                    createdAt: 'asc'
                }
            });
        } catch (err) {
            console.log(err);
            return err;
        }
    },
    update: async ({ params, body }: {
        params: {
            id: string
        },
        body: BookInterface
    }) => {
        try {
            const imageName = body.image.name ?? '';
            const image = body.image ?? null;

            const oldBook = await prisma.book.findUnique({
                where: {
                    id: params.id
                }
            })

            if (imageName != '' && imageName != undefined) {

                const file = Bun.file("public/uploads/" + oldBook?.image);

                if (await file.exists()) {
                    await file.delete();
                }

                Bun.write('public/uploads/' + imageName, image);
            }

            const book = await prisma.book.update({
                data: {
                    name: body.name,
                    price: parseInt(body.price.toString()),
                    isbn: body.isbn,
                    description: body.description,
                    image: imageName == undefined ? oldBook?.image : imageName
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
            const oldBook = await prisma.book.findUnique({
                where: {
                    id: params.id
                }
            })

            if (oldBook?.image != null) {
                const filePath = 'public/uploads/' + oldBook.image;
                const file = Bun.file(filePath);

                if (await file.exists()) {
                    await file.delete();
                }
            }

            await prisma.book.delete({
                where: {
                    id: params.id
                }
            })

            return { message: 'success' }
        } catch (error) {
            return { error: error }
        }
    }
}
