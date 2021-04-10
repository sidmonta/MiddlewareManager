# Middleware Manager

- Zero dependency
- Small package (4kb - 674b gzip)
- Use in node and browser

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
