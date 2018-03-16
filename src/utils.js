import get from 'lodash.get'
import some from 'lodash.some'
import mapValues from 'lodash.mapvalues'

export const arrayze = a => (Array.isArray(a) ? a : [a])

// Hight Order Reducer for reset a piece of state on certain actions
export const resetReducerOn = (matchTypes, reducer) => {
  // Match fn
  const match = action =>
    some(arrayze(matchTypes), matchType => {
      // TODO: Implement more option for matching type from outside!
      return matchType === action.type
    })

  return (previousState, action) => {
    // Match action! Reset this piece of state
    if (match(action)) {
      return reducer(undefined, action)
    }
    return reducer(previousState, action)
  }
}

export const composeReducers = (...reducers) => (prevState, action) =>
  reducers.reduce((nextState, reducer) => {
    if (typeof prevState === 'undefined') {
      // When le fukin prevState is undefined merge reducers
      // initial states... Cekka
      return { ...nextState, ...reducer(undefined, action) }
    } else {
      return reducer(nextState, action)
    }
  }, prevState)

// Helper for select from both string and function
export const getOrSelect = (obj, selector) => {
  if (typeof selector === 'function') {
    return selector(obj)
  }
  return get(obj, selector)
}

// Proxy an object of fucntions
export const proxyObject = (obj, proxy) => {
  if (typeof proxy === 'function') {
    return {
      ...obj,
      ...proxy(obj),
    }
  }
  if (typeof proxy === 'object') {
    return {
      ...obj,
      ...mapValues(proxy, proxyFn => proxyFn(obj)),
    }
  }
  return obj
}

export const proxyReducer = (reducer, proxyFn) => {
  if (typeof proxyFn === 'function') {
    return proxyFn(reducer)
  }
  return reducer
}
