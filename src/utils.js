import get from 'lodash.get'
import mapValues from 'lodash.mapvalues'

export const arrayze = a => (Array.isArray(a) ? a : [a])

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
