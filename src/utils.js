import mapValues from 'lodash.mapvalues'

export const arrayze = a => (Array.isArray(a) ? a : [a])

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
