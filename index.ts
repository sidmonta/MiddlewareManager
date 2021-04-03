/**
 * Luca Montanera
 */

/**
 * Funzione cardine del progetto, fa il pipe delle operazioni
 */
export async function pipe(...middlewares) {

}

/**
 * Esegue un middleware solo se la condizione è verificata
 */
export async function when(condition, middleware) {

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
export async function ask(index: number) {

}

/**
 * Inserisce nello stack della pipe un tag per identificarlo in seguito
 */
export async function pushTag() {

}

/**
 * Ritorna il valore del tag
 */
export async function popTag() {

}

/**
 * Esegue un'altra pipe, ma come se fosse una middleware
 */
export async function asMiddleware() {

}

export * as commonMiddleware from './common-middleware'
