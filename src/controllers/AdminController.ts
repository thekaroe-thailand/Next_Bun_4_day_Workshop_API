import { PrismaClient } from "../../generated/prisma";
import { AdminInterface } from "../interface/AdminInterface";
const prisma = new PrismaClient();

export const AdminController = {
    create: async ({ body }: {
        body: AdminInterface
    }) => {
        try {
            const admin = await prisma.admin.create({
                data: body
            })
            return admin
        } catch (err) {
            return err;
        }
    },
    signin: async ({ body, jwt }: {
        body: {
            username: string
            password: string
        },
        jwt: any
    }) => {
        try {
            const admin = await prisma.admin.findUnique({
                where: {
                    username: body.username,
                    password: body.password,
                    status: 'active'
                },
                select: {
                    id: true,
                    name: true
                }
            })

            if (!admin) {
                return new Response("user not found", { status: 401 });
            }

            const token = await jwt.sign(admin)
            return { token: token }
        } catch (err) {
            return err;
        }
    },
    info: async ({ request, jwt }: {
        request: {
            headers: any
        },
        jwt: any
    }) => {
        try {
            const token = request.headers.get('Authorization').replace('Bearer ', '');
            const payload = await jwt.verify(token);
            const admin = await prisma.admin.findUnique({
                where: {
                    id: payload.id
                },
                select: {
                    name: true,
                    level: true
                }
            })

            return admin
        } catch (err) {
            return err
        }
    }
}