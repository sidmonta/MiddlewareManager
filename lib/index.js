/**
 * Luca Montanera
 */

/**********************
 * UTILITY
 *********************/

const _factory = (deps) => (middleware) => middleware(deps)
const _pipe = async (param, ...middlewares) => {
  let stack = []
  let paramUnknown = param
  for (const mid of middlewares) {
    stack.push(param)
    paramUnknown = await mid(paramUnknown as E, stack)
  }

  return paramUnknown as R
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

}

/**
 * Intercetta una eccezione in una middleware e ne traccia un'altra
 */
export async function tryCatch(tryMiddleware, catchMiddleware) {

}

/**
 * Esegue una middleware finché una condizione non risulta vera
 */
export async function loop(condition, middleware) {

}

/**
 * Esegue la prima middleware se la condizione è vera, altrimenti la seconda
 */
export async function ifElse(condition, ifMiddleware, elseMiddleware) {

}

/**
 * Esegue più middleware contemporaneamente
 */
export async function concurrency(...middlewares) {

}

/**
 * Recupera dallo stack il valore ritornato dalla n-esima middleware
 */
export async function ask(index) {

}

/**
 * Inserisce nello stack della pipe un tag per identificarlo in seguito
 */
export async function pushTag(tag) {

}

/**
 * Ritorna il valore del tag
 */
export async function popTag(tag) {

}

/**
 * Esegue un'altra pipe, ma come se fosse una middleware
 */
export async function asMiddleware(...middlewares]) {
  return (deps) => async (param) => {
    return await pipe(deps)(param, ...middlewares)
  }
}

export * as commonMiddleware from './common-middleware'
