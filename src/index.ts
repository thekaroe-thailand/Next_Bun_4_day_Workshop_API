import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysiajs/jwt'; // bun add @elysiajs/jwt
import { env } from "bun";

import CustomerController from "./controllers/CustomerController";  // export default
import { BookController } from "./controllers/BookController";      // export const BookController


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
    })

    //
    // book controller
    //
    .group('/api/book', app => app
        .post('/', BookController.create)
        .get('/', BookController.list)
        .put('/:id', BookController.update)
        .delete('/:id', BookController.delete)
    )

    //
    // customer controller
    //
    .get('/customers', CustomerController.list)
    .post('/customers', CustomerController.create)
    .put('/customers/:id', CustomerController.update)
    .delete('/customers/:id', CustomerController.remove)

app.listen(3001);

console.log('Server start');