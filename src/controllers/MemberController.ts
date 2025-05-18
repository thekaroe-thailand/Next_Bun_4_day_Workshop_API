import type { MemberInterface } from "../interface/MemberInterface";
import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();

export const MemberController = {
    signup: async ({ body }: { body: MemberInterface }) => {
        try {
            await prisma.member.create({
                data: {
                    phone: body.phone,
                    username: body.username,
                    password: body.password
                }
            })
        } catch (err) {
            return { error: err }
        }
    },
    signin: async ({
        body, jwt
    }: {
        body: {
            username: string,
            password: string
        },
        jwt: any
    }) => {
        try {
            const member = await prisma.member.findUnique({
                where: {
                    username: body.username,
                    password: body.password,
                    status: 'active'
                },
                select: {
                    id: true
                }
            })

            if (!member) {
                return new Response("user not found", { status: 401 })
            }

            const token = await jwt.sign(member)
            return { token: token }
        } catch (err) {
            return { error: err }
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
            const member = await prisma.member.findUnique({
                where: {
                    id: payload.id
                },
                select: {
                    username: true,
                    id: true
                }
            })

            return member
        } catch (err) {
            return err
        }
    },
}