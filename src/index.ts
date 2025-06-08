import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysiajs/jwt'; // bun add @elysiajs/jwt

// middleware 
const checkSignIn = async ({ jwt, request, set }: any) => {
    const token = request.headers.get('Authorization').split(' ')[1];

    if (!token) {
        set.status = 401;
        return 'Unauthorized';
    }

    const payload = await jwt.verify(token, 'secret');

    if (!payload) {
        set.status = 401;
        return 'Unauthorized';
    }
}

const app = new Elysia()
    .use(cors())
    .use(staticPlugin())
    .use(jwt({
        name: 'jwt',
        secret: 'secret'
    }))
    .get('/', () => {
        return { message: 'Hello' }
    });

app.listen(3001);

console.log('Server start');