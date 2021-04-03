import * as P from './lib/index'

const deps = {
  logger: {
    info: console.log,
    warn: console.warn,
    error: console.error
  }
}

const pipe = P.pipe(deps)

const testMiddleware: Middleware<typeof deps, number, number> = ({ logger }) => (num) => {
  const i = num * 10
  logger.info(i)
  return i
}

const testMiddleware2: Middleware<typeof deps, string, number> = ({ logger }) => (num) => {
  const i = num + 'maionese'
  logger.info(i)
  return 1000
}

async function run() {
  const res = await pipe(10, testMiddleware, testMiddleware2)
}

run().then().catch()