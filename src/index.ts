import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';

const app = new Elysia()
    .get('/', () => {
        return { message: 'Hello' }
    });

app.listen(3001);

console.log('Server start');