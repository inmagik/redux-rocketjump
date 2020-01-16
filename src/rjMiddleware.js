let callbacksId = 0
const callbacksMap = {}

export const registerCallbacks = callbacks => {
  const nextId = ++callbacksId
  callbacksMap[nextId] = callbacks
  return [
    nextId,
    () => {
      delete callbacks[nextId]
    },
  ]
}

const rjMiddleware = store => next => action => {
  if (action.meta && callbacksMap[action.meta.rjCallId]) {
    // Current action match a callback id in current hook context
    const rjCallId = action.meta.rjCallId
    const callbacks = callbacksMap[rjCallId]

    if (action.type.indexOf('SUCCESS') !== -1) {
      // On Success
      if (typeof callbacks.onSuccess === 'function') {
        callbacks.onSuccess(action.payload.data)
      }
      callbacks.onComplete()
      delete callbacks[rjCallId]
    } else if (action.type.indexOf('FAILURE') !== -1) {
      // On Failure
      if (typeof callbacks.onFailure === 'function') {
        callbacks.onFailure(action.payload)
      }
      callbacks.onComplete()
      delete callbacks[rjCallId]
    }
  }
  next(action)
}

export default rjMiddleware
