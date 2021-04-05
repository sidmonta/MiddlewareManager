/**********************
 * UTILITY
 *********************/

export class StopCall extends Error {}

const _factory = (deps) => (middleware) => middleware(deps)
const _pipe = async (param, ...middlewares) => {
  let stack = []
  let paramUnknown = param
  for (const mid of middlewares) {
    stack.push(param)
    paramUnknown = await mid(paramUnknown, stack)
  }

  return paramUnknown
}

/**
 * Funzione cardine del progetto, fa il pipe delle operazioni
 */
export function pipe(deps) {
  return async (...middlewares) => {
    const firstParam = middlewares.shift()
    try {
      return await _pipe(
        firstParam,
        ...middlewares.map((mid) => _factory(deps)(mid))
      )
    } catch (err) {
      if (!(err instanceof StopCall)) {
        throw err
      }
    }
  }
}

/**
 * Esegue un middleware solo se la condizione è verificata
 */
export function when(condition, middleware) {
  return (deps) => async (...params) => {
    if (condition(...params)) {
      return await middleware(deps)(...params)
    }
    return params[0]
  }
}

/**
 * Intercetta una eccezione in una middleware e ne traccia un'altra
 */
export function tryCatch(tryMiddleware, catchMiddleware) {
  return (deps) => async (...params) => {
    try {
      return await tryMiddleware(deps)(...params)
    } catch (error) {
      return await catchMiddleware(deps)(error, ...params)
    }
  }
}

/**
 * Esegue una middleware finché una condizione non risulta vera
 */
export function loop(condition, middleware) {
  return (deps) => async (...params) => {
    let index = 0
    let tmpParam = params[0]
    const stackTail = params.slice(1)
    while (condition(tmpParam, index++, ...stackTail)) {
      tmpParam = await middleware(deps)(tmpParam, ...stackTail)
    }
    return tmpParam
  }
}

/**
 * Esegue la prima middleware se la condizione è vera, altrimenti la seconda
 */
export function ifElse(condition, ifMiddleware, elseMiddleware) {
  return (deps) => async (...params) =>
    condition(...params)
      ? await ifMiddleware(deps)(...params)
      : await elseMiddleware(deps)(...params)
}

/**
 * Esegue più middleware contemporaneamente
 */
export function concurrency(...middlewares) {
  return (deps) => async (...param) => {
    const result = await Promise.allSettled(
      middlewares.map((mid) => mid(deps)(...param))
    )
    const toReturn = []
    for (const res of result) {
      if (res.status === "rejected" && !(res.reason instanceof StopCall)) {
        throw res.reason
      }
      toReturn.push(res.value || false)
    }
    return toReturn
  }
}

/**
 * Recupera dallo stack il valore ritornato dalla n-esima middleware
 */
export function ask(index) {
  return (deps) => (param, stack) => stack[index] || undefined
}

/**
 * Esegue un'altra pipe, ma come se fosse una middleware
 */
export function pipAsMiddleware(...middlewares) {
  return (deps) => async (param) => {
    return await pipe(deps)(param, ...middlewares)
  }
}

/**
 * Merge n-pipe operator
 * @param  {...any} opts
 * @returns
 */
export async function merge(...opts) {
  const list = []
  for (const opt of opts) {
    list.push(await opt)
  }
  return list
}

export function flow(...middlewares) {
  return (overrideDeps) => async (firstParam) =>
    await pipe(overrideDeps)(...[firstParam, ...middlewares])
}

export function asMiddleware(funct) {
  return () => funct
}

export * as commonMiddleware from "./common-middleware"
