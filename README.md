# Pipe Middleware Manager

- Zero dependency
- Small package (4kb - 674b gzip)
- Use in node and browser

Library that facilitate pipe operator for manage middleware.

A **middleware** is a function in this form:

```js
function Middleware(deps) {
  return function (value, queue) {
    // ...body of function...
    return newValue
  }
}
```

where:

- `deps` are the dependences of pipe operator;
- `value` is the returned value of previous middleware
- `queue` is the list of value of all previous middlewares in order of execution
- `newValue` is the value generated from the middleware and passed to successor middleware

## Middleware manager operators

- **pipe(deps)(...middlewares)**:

  Execute the middlewares in orders

  ```js
  const deps = { ... }
  const result = await pipe(deps)(
    firstValue
    middleware1,
    middleware2,
    ...
    middlewareN
  )

  ```

- **when(condition, middleware)**:

  If condition function return `true` the middleware is executed, otherwise no.
  The condition is a function in input the previous value and return a boolean.

  ```js
  const result = await pipe(
    ...
    when(
      (value, queue) => Boolean(value),
      middleware
    ),
    ...
  )

  ```

- **tryCatch(tryMiddleware, catchMiddleware)**:

  If the tryMiddleware throw a error the catchMiddleware is call.

  ```js
  const result = await pipe(
    ...
    tryCatch(
      tryMiddleware,
      catchMiddleware
    ),
    ...
  )

  ```

- **loop(condition, middleware)**:

  Execute the middleware as long as the condition function return `true`.

  ```js
  const result = await pipe(
    ...
    loop(
      (value, index, queue) => Boolean(value),
      middleware
    ),
    ...
  )

  ```

  The `index` identify the number of iterator of middleware. It can be use for simulate for-loop

- **ifElse(condition, ifMiddleware, elseMiddleware)**:

  Execute ifMiddleware if the condition function return `true`, the elseMiddleware otherwise

  ```js
  const result = await pipe(
    ...
    ifElse(
      (value, queue) => Boolean(value),
      ifMiddleware,
      eseMiddleware
    ),
    ...
  )

  ```

- **concurrency(...middlewares)**:

  Execute a list of middleware in concurrency

  ```js
  const result = await pipe(
    ...
    concurrency(
      middleware1,
      middleware2,
      ...
      middlewareN
    ),
    ...
  )

  ```

- **ask(index)**:

  Extract the value of the queue values of the middlewares and shifth in head.

  ```js
  const result = await pipe(
    ...
    middlewareN,
    ...
    ask(N),
    ...
  )

  ```

- **pipeAsMiddleware(...middlewares)**:

  It's veru important function. Transform a pipe operator as a middleware.

  ```js
  const result = await pipe(
    ...
    middleware5a,
    pipeAsMiddleware(
      middleware1b,
      middleware2b,
      middleware3b,
    ),
    middleware6a,
    ...
  )

  ```

- **merge(...middlewares)**:

  Merge the execution of n-middlewares

  ```js
  const result = await pipe(
    ...
    merge(
      middleware1,
      middleware2,
      ...
      middlewareN
    ),
    ...
  )

  ```

- **flow(...middlewares)(deps)(firstParam)**:

  Allows you to postpone the execution of the pipe for when needed.

  ```js
  const execution = flow(middleware1, middleware2, ...middlewareN)

  const result = await execution(deps)(firstValue)
  ```

- **asMiddleware(function)**:

  Transform a function in a middleware

  ```js
  const func = (value) => {
    ...
    return newValue
  }

  const result = await pipe(
    ...
    asMiddleware(func),
    ...
  )

  ```

## Common middleware

- **throwError(errorMessage)**:

  Throw error. `errorMessage` can be a string of the error or a function that generate the string of the error based of value of previous middleware.

  ```js
  const result = await pipe(
    ...
    throwError('a new error occurred'),
    ...
  )
  // Or
  const result = await pipe(
    ...
    throwError((value) => `a new error occurred because ${value} is wrong`),
    ...
  )
  ```

- **stop(message)**:

  Middleware that stop the execution of pipe. Like the **throwError** `message` can be a string of the error or a function that generate the string of the error based of value of previous middleware.

  ```js
  const result = await pipe(
    ...
    middlewareN,
    ...
    stop('stop the execution'),
    middlewareNeverCall,
    ...
  )

  ```

- **pushData**:

  Middleware that return static new value on the middleware-pipe execution

  ```js
  const result = await pipe(
    ...
    pushData(newValue),
    ...
  )

  ```

- **tap**:

  Execute a side-effect function. The function must not return a value, if it does it will be ignored.

  ```js
  const result = await pipe(
    ...
    tap((value, queue) => {
      console.log(value)
    }),
    ...
  )

  ```

- **map**:

  Trasform the value in a newValue

  ```js
  const result = await pipe(
    ...
    map(value => {
      return value + 1000
    }),
    ...
  )
  ```

> **StopError**:
>
> It's a special error that Stop the execution of pipe, can it use when force the finish of pipe without break the execution of program.

---

### Examples

```js
import * as PM from "pipe-manager"

const { commonMiddleware } = PM

/*
 Basic usage
 */
const middleware1 = PM.asMiddleware((value) => value + 1)
const middleware2 = PM.asMiddleware((value) => value + 2)

const result = await PM.pipe()(0, middleware1, middleware2)

console.log(result) // 3

/*
 With deps
 */

const deps = {
  db: { insert: async () => {}, delete: async () => {} },
  logger: console,
}

const middleware3 = (deps) => {
  const { db, logger } = deps

  return async (value) => {
    logger.info(`Insert in db: ${value}`)
    return await db.insert(value)
  }
}

const pipeWithDeps = PM.pipe(deps)

const result = await pipeWithDeps(0, middleware1, middleware2, middleware3)

console.log(result) // true|false

/*
 When
 */

const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.when((value) => value > 3, middleware3),
  middleware1
)

console.log(result) // 4

const result = await PM.pipe(deps)(
  1,
  middleware1, // 2
  middleware2, // 4
  PM.when((value) => value > 3, middleware3),
  middleware1
)

console.log(result) // 5

/*
 tryCatch
 */

const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.tryCatch(middleware3, middleware2),
  middleware1
)
console.log(result)
// If db insert throw error -> 6
// Else -> 4

/*
 loop
 */

const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.loop((value) => value < 5, middleware1), // middleware1 is execute 2 time
  middleware1
)
console.log(result) // 6

const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.loop((value, index) => index < 100, middleware1), // middleware1 is execute 100 time
  middleware1
)
console.log(result) // 104

/*
 ifElse
 */
const result = await PM.pipe(deps)(
  1,
  middleware1, // 2
  middleware2, // 4
  PM.ifElse((value) => value > 3, middleware1, middleware2),
  middleware1
)

console.log(result) // 6

const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.ifElse((value) => value > 3, middleware1, middleware2),
  middleware1
)

console.log(result) // 6

/*
 concurrency
 */

const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.concurrency(
    middleware1, // 4
    middleware2, // 5
    middleware1, // 4
    middleware2, // 5
    middleware1, // 4
    middleware2 // 5
  )
)

console.log(result) // [4,5,4,5,4,5]

/*
 ask
 */
const result = await PM.pipe(deps)(
  /*0*/ 0,
  /*1*/ middleware1, // 1
  /*2*/ middleware2, // 3
  /*3*/ PM.ask(1),
  /*4*/ middleware1
)

console.log(result) // 2

const result = await PM.pipe(deps)(
  /*1*/ 0,
  /*2*/ middleware1, // 1
  /*3*/ middleware2, // 3
  /*4*/ PM.ask(5), // <- undefined
  /*5*/ middleware1
)

console.log(result) // NaN

/*
 pipeAsMiddleware
 */
const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.pipeAsMiddleware(
    middleware2, // 5
    middleware2 // 7
  ),
  middleware1
)
console.log(result) // 8

/*
 Complete example
 */

const result = await PM.pipe(deps)(
  0,
  middleware1, // 1
  middleware2, // 3
  PM.tryCatch(
    PM.pipeAsMiddleware(middleware1, middleware3), // 4 - true
    commonMiddleware.throwError("Error on insert in db")
  ),
  PM.when(
    (value) => value === false,
    commonMiddleware.throwError("Error on insert in db")
  ),
  PM.ask(2), // 3
  middleware2, // 5
  PM.loop((, index) => index < 100, middleware1) // 105
  PM.ifElse(
    (value) => value > 100,
    PM.pipeAsMiddleware(
      middleware1, // 106
      middleware1, // 107
      middleware1 // 108
    ),
    PM.pipeAsMiddleware(
      middleware2,
      middleware2
    )
  ),
  PM.concurrency(
    PM.pipeAsMiddleware(
      middleware1, // 109
      middleware3, // true
      when(value => !value, commonMiddleware.stop())
    ),
    PM.pipeAsMiddleware(
      middleware2, // 110
      middleware3, // true
      when(value => !value, commonMiddleware.stop())
    )
  ) // [true, true]
)
```
