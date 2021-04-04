export function throwError(errorMessage) {}

export function stop(stopMessage) {
  return () => () => {
    throw new StopCall(stopMessage)
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
