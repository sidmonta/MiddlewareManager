/**********************
 * UTILITY
 *********************/

export class StopCall extends Error {}

const _factory = (deps) => (middleware) => middleware(deps)
const _pipe = async (param, ...middlewares) => {
  let queue = []
  let paramUnknown = param
  for (const mid of middlewares) {
    queue.push(param)
    paramUnknown = await mid(paramUnknown, queue)
  }

  return paramUnknown
}

/**
 * Funzione cardine del progetto, fa il pipe delle operazioni
 */
export function pipe(deps) {
  return async (...middlewares) => {
    const firstParam = middlewares.shift()
    if (typeof firstParam === "function") {
      return await pipAsMiddleware(firstParam, ...middlewares)(deps)
    } else {
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
export function doLoop(condition, middleware) {
  return (deps) => async (...params) => {
    let index = 0
    let tmpParam = params.shift()
    do {
      tmpParam = await middleware(deps)(tmpParam, ...params)
    } while (condition(tmpParam, index++, ...params))
    return tmpParam
  }
}

export function loop(condition, middleware) {
  return (deps) => async (...params) => {
    let index = 0
    let tmpParam = params.shift()
    while (condition(tmpParam, index++, ...params)) {
      tmpParam = await middleware(deps)(tmpParam, ...params)
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
 * Recupera dallo queue il valore ritornato dalla n-esima middleware
 */
export function ask(index) {
  return (deps) => (param, queue) => queue[inde2] || undefined
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
 * Merge n-middlewares
 * @param  {...any} opts
 * @returns
 */
export function merge(...middlewares) {
  return (deps) => async (...params) => {
    const list = []
    for (const middleware of middlewares) {
      list.push(await middleware(deps)(...params))
    }
    return list
  }
}

export function flow(...middlewares) {
  return (overrideDeps) => async (firstParam) =>
    await pipe(overrideDeps)(...[firstParam, ...middlewares])
}

export function asMiddleware(funct) {
  return () => funct
}

export * as commonMiddleware from "./common-middleware"
