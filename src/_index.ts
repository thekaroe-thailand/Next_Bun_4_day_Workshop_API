import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';  // bun add @elysiajs/swagger
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysiajs/jwt'; // bun add @elysiajs/jwt

import CustomerController from "./controllers/CustomerController";  // export default
import { BookController } from "./controllers/BookController";      // export const BookController
import { AdminController } from "./controllers/AdminController";
import { MemberController } from "./controllers/MemberController";
import { CartController } from "./controllers/CartController";
import { OrderController } from "./controllers/OrderController";
import { DashboardController } from "./controllers/DashboardController";

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

  // 
  // dashboard
  //
  .group('/api/dashboard', app => app
    .get('/list', DashboardController.list, { beforeHandle: checkSignIn })
  )

  //
  // order
  //
  .group('/api/order', app => app
    .get('/list', OrderController.list, { beforeHandle: checkSignIn })
    .delete('/cancel/:id', OrderController.cancel, { beforeHandle: checkSignIn })
    .put('/paid/:id', OrderController.paid, { beforeHandle: checkSignIn })
    .put('/send', OrderController.send, { beforeHandle: checkSignIn })
  )

  //
  // cart
  //
  .group('/api/cart', app => app
    .post('/add', CartController.add)
    .get('/list/:memberId', CartController.list)
    .delete('/delete/:id', CartController.delete)
    .put('/upQty/:id', CartController.upQty)
    .put('/downQty/:id', CartController.downQty)
    .post('/confirm', CartController.cartConfirm)
    .post('/uploadSlip', CartController.uploadSlip)
    .post('/confirmOrder', CartController.confirmOrder)
  )

  //
  // member
  //
  .group('/api/member', app => app
    .post('/signup', MemberController.signup)
    .post('/signin', MemberController.signin)
    .get('/info', MemberController.info)
    .get('/history', MemberController.history)
  )

  // 
  // admin
  //
  .group('/api/admin', app => app
    .post('/create', AdminController.create)
    .post('/signin', AdminController.signin)
    .get('/info', AdminController.info)
    .put('/update', AdminController.update)
    .get('/list', AdminController.list)
    .put('/update-data/:id', AdminController.updateData)
    .delete('/remove/:id', AdminController.remove)
  )

  //
  // book controller
  //
  .group('/api/book', app => app
    .post('/', BookController.create)
    .get('/', BookController.list)
    .put('/:id', BookController.update)
    .delete('/:id', BookController.delete)
  )

  /*
  .post('/api/book', BookController.create)
  .get('/api/book', BookController.list)
  .put('/api/book/:id', BookController.update)
  .delete('/api/book/:id', BookController.delete)
  */

  // customer controller
  .get('/customers', CustomerController.list)
  .post('/customers', CustomerController.create)
  .put('/customers/:id', CustomerController.update)
  .delete('/customers/:id', CustomerController.remove)

  .get('/info', async ({ jwt, request }) => {
    if (request.headers.get('Authorization') === null) {
      return { message: 'No Authorization header' }
    }

    const token = request.headers.get('Authorization') ?? '';

    if (token === '') {
      return { message: 'No token' }
    }

    const payload = await jwt.verify(token);

    return {
      message: 'Hello Elysia',
      payload: payload
    }
  })

  .post('/login', async ({ jwt, cookie: { auth } }) => {
    const user = {
      id: 1,
      username: 'admin',
      level: 'admin'
    }

    const token = await jwt.sign(user)

    auth.set({
      value: token,
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return { token: token }
  })

  .get('/profile', ({ jwt, cookie: { auth } }) => {
    const user = jwt.verify(auth.value);
    return user;
  })
  .get('/logout', ({ cookie: { auth } }) => {
    auth.remove();

    return { message: 'Logged out' }
  })

  // 
  // APIs
  //
  .get("/", () => "Hello Elysia")
  .get('/hello', () => {
    return 'Hello by API'
  })
  .get('/json-data', () => {
    return { message: 'Hello' }
  })
  .get('/hello/:name', ({ params }) => {
    return 'name = ' + params.name
  })
  .get('/hello/:name/:age', ({ params }) => {
    const name = params.name;
    const age = params.age;

    return {
      name: name,
      age: age
    }
  })
  .get('/api/person/:id/:name', ({ params }: {
    params: {
      id: string,
      name: string
    }
  }) => {
    const id = params.id;
    const name = params.name;

    return { id: id, name: name }
  })
  .get('/customers/query', ({ query }: {
    query: {
      name: string,
      age: number
    }
  }) => {
    const name = query.name;
    const age = query.age;

    return {
      name: name,
      age: age
    }
  })

  // post
  .post('/book/create', ({ body }: {
    body: {
      id: string,
      name: string,
      price: number
    }
  }) => {
    const id = body.id;
    const name = body.name;
    const price = body.price;

    return {
      id: id,
      name: name,
      price: price
    }
  })

  // put
  .put('/book/update/:id', ({ params, body }: {
    params: {
      id: string
    },
    body: {
      name: string,
      price: number
    }
  }) => {
    const id = params.id;
    const name = body.name;
    const price = body.price;

    return { message: 'success' }
  })

  // delete
  .delete('/book/delete/:id', ({ params }: {
    params: {
      id: string
    }
  }) => {
    return { id: params.id }
  })

  // upload file
  .post('/upload-file', ({ body }: {
    body: {
      file: File
    }
  }) => {
    Bun.write('uploads/' + body.file.name, body.file);
    return { message: 'uploaded' }
  })

  // write file
  .get('/write-file', () => {
    Bun.write('test.txt', 'Hello World')
    return { message: 'success' }
  })

  // read file
  .get('/read-file', () => {
    const file = Bun.file('test.txt')
    return file.text();
  })

  // test qr code promptpay


  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
