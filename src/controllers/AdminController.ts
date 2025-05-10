import jwt from "@elysiajs/jwt";
import { PrismaClient } from "../../generated/prisma";
import { AdminInterface } from "../interface/AdminInterface";
const prisma = new PrismaClient();

const getAdminIdByToken = async (request: any, jwt: any) => {
    const token = request.headers.get('Authorization').replace('Bearer ', '');
    const payload = await jwt.verify(token);

    return payload.id;
}

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
                    level: true,
                    username: true
                }
            })

            return admin
        } catch (err) {
            return err
        }
    },
    update: async ({ body, jwt, request }: {
        body: AdminInterface,
        jwt: any,
        request: any
    }) => {
        try {
            const adminId = await getAdminIdByToken(request, jwt);
            const oldAdmin = await prisma.admin.findUnique({
                where: {
                    id: adminId
                }
            })
            await prisma.admin.update({
                data: {
                    name: body.name,
                    username: body.username,
                    password: body.password ?? oldAdmin?.password
                },
                where: {
                    id: adminId
                }
            })
            return { message: 'success' }
        } catch (err) {
            return err
        }
    },
    list: async () => {
        try {
            const admins = await prisma.admin.findMany({
                select: {
                    id: true,
                    name: true,
                    username: true,
                    level: true
                },
                orderBy: {
                    name: 'asc'
                },
                where: {
                    status: 'active'
                }
            })
            return admins;
        } catch (error) {
            return error
        }
    },
    updateData: async ({ params, body }: {
        params: {
            id: string
        },
        body: AdminInterface
    }) => {
        try {
            const admin = await prisma.admin.findUnique({
                where: {
                    id: params.id
                }
            })

            await prisma.admin.update({
                data: {
                    name: body.name,
                    username: body.username,
                    password: body.password ?? admin?.password,
                    level: body.level
                },
                where: {
                    id: params.id
                }
            })
        } catch (error) {
            return error
        }
    },
    remove: async ({ params }: {
        params: {
            id: string
        }
    }) => {
        try {
            await prisma.admin.update({
                data: {
                    status: 'inactive'
                },
                where: {
                    id: params.id
                }
            })
        } catch (err) {
            return err
        }
    }
}





























