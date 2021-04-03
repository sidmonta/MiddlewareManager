/**
 * Luca Montanera
 */

import type { Middleware, MiddlewareCondition } from './types'

/**
 * Funzione cardine del progetto, fa il pipe delle operazioni
 */
export async function pipe<D>(...middlewares: Middleware<D, unknown, unknown>[]) {

}

/**
 * Esegue un middleware solo se la condizione è verificata
 */
export async function when<D, E, R>(condition: MiddlewareCondition<E>, middlewar: Middleware<D, E, R>) {

}

/**
 * Intercetta una eccezione in una middleware e ne traccia un'altra
 */
export async function tryCatch<D, E, R, K extends Error>(tryMiddleware: Middleware<D, E, R>, catchMiddleware: Middleware<D, K, R>) {

}

/**
 * Esegue una middleware finché una condizione non risulta vera
 */
export async function loop<D, E, R>(condition: (param: E, index: number, stack: unknown[]) => boolean, middleware: Middleware<D, E, R>) {

}

/**
 * Esegue la prima middleware se la condizione è vera, altrimenti la seconda
 */
export async function ifElse<D, E, R>(condition: MiddlewareCondition<E>, ifMiddleware: Middleware<D, E, R>, elseMiddleware: Middleware<D, E, R>) {

}

/**
 * Esegue più middleware contemporaneamente
 */
export async function concurrency<D, E, R>(...middlewares: Middleware<D, E, R>[]) {

}

/**
 * Recupera dallo stack il valore ritornato dalla n-esima middleware
 */
export async function ask(index: number) {

}

/**
 * Inserisce nello stack della pipe un tag per identificarlo in seguito
 */
export async function pushTag(tag: string) {

}

/**
 * Ritorna il valore del tag
 */
export async function popTag(tag: string) {

}

/**
 * Esegue un'altra pipe, ma come se fosse una middleware
 */
export async function asMiddleware() {

}

export * as commonMiddleware from './common-middleware'
