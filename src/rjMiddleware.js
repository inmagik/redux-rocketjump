let callbacksId = 0
const callbacksMap = {}

export const registerCallbacks = callbacks => {
  const nextId = ++callbacksId
  callbacksMap[nextId] = callbacks
  return [
    nextId,
    () => {
      delete callbacksMap[nextId]
    },
  ]
}

const strEndsWith = (str, search) => {
  const len = str.length
  return str.substring(len - search.length, len) === search
}

const rjMiddleware = store => next => action => {
  if (action.meta && callbacksMap[action.meta.rjCallId]) {
    // Current action match a callback id in current hook context
    const rjCallId = action.meta.rjCallId
    const callbacks = callbacksMap[rjCallId]

    if (strEndsWith(action.type, 'SUCCESS')) {
      // On Success
      if (typeof callbacks.onSuccess === 'function') {
        callbacks.onSuccess(action.payload.data)
      }
      callbacks.onComplete()
      delete callbacksMap[rjCallId]
    } else if (strEndsWith(action.type, 'FAILURE')) {
      // On Failure
      if (typeof callbacks.onFailure === 'function') {
        callbacks.onFailure(action.payload)
      }
      callbacks.onComplete()
      delete callbacksMap[rjCallId]
    }
  }
  next(action)
}

export default rjMiddleware
