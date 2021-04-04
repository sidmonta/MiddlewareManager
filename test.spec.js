const P = require("./lib")

const deps = {
  logger: {
    info: console.log,
    warn: console.warn,
    error: console.error,
  },
}

const pipe = P.pipe(deps)

const testMiddleware = ({ logger }) => (num) => {
  const i = num * 10
  logger.info(i)
  return i
}

const testMiddleware2 = ({ logger }) => (num) => {
  const i = num + "maionese"
  logger.info(i)
  return i
}

async function run() {
  const res = await pipe(10, testMiddleware, testMiddleware2)

  const merged = await P.merge(
    pipe(10, testMiddleware),
    pipe("panino", testMiddleware2)
  )

  const functions = P.flow(testMiddleware, testMiddleware2)

  const ss = functions(deps)

  console.log(res, merged, await ss(10))
}

run().then(console.log).catch(console.error)
