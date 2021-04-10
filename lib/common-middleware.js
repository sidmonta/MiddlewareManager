const generateMessage = (message, params) =>
  typeof message === "function" ? message(...params) : message

export function throwError(errorMessage) {
  return () => (...params) => {
    throw new Error(generateMessage(errorMessage))
  }
}

export function stop(stopMessage) {
  return () => () => {
    throw new StopCall(generateMessage(stopMessage))
  }
}

export function pushData(data) {
  return () => () => data
}

export function tap(fun) {
  return (deps) => async (...params) => {
    await fun(...params)
    return params[0]
  }
}

export function map(fun) {
  return (deps) => async (...params) => await fun(...params)
}
