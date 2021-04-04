/**
 * Luca Montanera
 */

/**********************
 * UTILITY
 *********************/

class StopCall extends Error {}

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
function pipe(deps) {
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
function when(condition, middleware) {
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
function tryCatch(tryMiddleware, catchMiddleware) {
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
function loop(condition, middleware) {
  return (deps) => async (...params) => {
    let index = 0
    let tmpParam = params[0]
    while (condition(tmpParam, index, ...params.slice(1))) {
      tmpParam = await middleware(deps)(tmpParam, ...params.slice(1))
    }
    return tmpParam
  }
}

/**
 * Esegue la prima middleware se la condizione è vera, altrimenti la seconda
 */
function ifElse(condition, ifMiddleware, elseMiddleware) {
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
function concurrency(...middlewares) {
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
function ask(index) {
  return (deps) => async (param, stack) => stack[index] || undefined
}

/**
 * Esegue un'altra pipe, ma come se fosse una middleware
 */
function pipAsMiddleware(...middlewares) {
  return (deps) => async (param) => {
    return await pipe(deps)(param, ...middlewares)
  }
}

async function merge(...opts) {
  const list = []
  for (const opt of opts) {
    list.push(await opt)
  }
  return list
}

function flow(...middlewares) {
  return (overrideDeps) => async (firstParam) =>
    await pipe(overrideDeps)(...[firstParam, ...middlewares])
}

module.exports = {
  StopCall,
  pipe,
  when,
  tryCatch,
  loop,
  ifElse,
  concurrency,
  ask,
  pipAsMiddleware,
  merge,
  flow,
  commonMiddleware: { ...require("./common-middleware") },
}
