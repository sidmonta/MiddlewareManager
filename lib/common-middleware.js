function throwError(errorMessage) {}

function stop(stopMessage) {
  return () => () => {
    throw new StopCall(stopMessage)
  }
}

function pushData(data) {
  return () => () => data
}

function tap(fun) {
  return (deps) => async (...params) => {
    await fun(...params)
    return params[0]
  }
}

module.exports = {
  throwError,
  stop,
  tap,
}
