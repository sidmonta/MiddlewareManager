
export type Middleware<D, E, R> = (deps: D) => (param: E, stack: unknown[]) => R

export type MiddlewareCondition<E> = (param: E, stack: unknown[]) => boolean