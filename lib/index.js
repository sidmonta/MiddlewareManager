/**
 * Luca Montanera
 */

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
    return await _pipe(
      firstParam,
      ...middlewares.map((mid) => _factory(deps)(mid))
    )
  }
}

/**
 * Esegue un middleware solo se la condizione è verificata
 */
export async function when(condition: MiddlewareCondition, middleware) {
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
export async function tryCatch(tryMiddleware, catchMiddleware) {
  return (deps) => async (...params) => {
    try {
      return await tryCatch(deps)(...params)
    } catch (error) {
      return await catchMiddleware(deps)(error, ...params)
    }
  }
}

/**
 * Esegue una middleware finché una condizione non risulta vera
 */
export async function loop(condition, middleware) {
  return (deps) => async (...params) => {
    let index = 0
    let tmpParam = params[0]
    while (condition(tmpParam, index, ...params.slice(1)))
      tmpParam = await middleware(deps)(tmpParam, ...params.slice(1))
    }
    return tmpParam
  }
}

/**
 * Esegue la prima middleware se la condizione è vera, altrimenti la seconda
 */
export async function ifElse(condition, ifMiddleware, elseMiddleware) {
  return (deps) => async (...params) => {
    if (condition(...params)) {
      return await ifMiddleware(deps)(...params)
    }
    return await elseMiddleware(deps)(...params)
  }
}

/**
 * Esegue più middleware contemporaneamente
 */
export async function concurrency(...middlewares) {
  return (deps) => async (...param) => {
    const result = await Promise.allSettled(middlewares.map(mid => mid(deps)(...param)))
    const toReturn = []
    for (const res of result) {
      if (res.status === 'rejected' && !(res.reason instanceof StopCall)) {
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
export async function ask(index) {
  return (deps) => async (param, stack) => stack[index] || undefined
}

/**
 * Esegue un'altra pipe, ma come se fosse una middleware
 */
export async function pipAsMiddleware(...middlewares]) {
  return (deps) => async (param) => {
    return await pipe(deps)(param, ...middlewares)
  }
}

export * as commonMiddleware from './common-middleware'
