export function get(obj, path, defaultValue = undefined) {
  const keys = path.split('.')
  const result = obj === null ? undefined : keys.reduce((context, current) => context[current], obj)
  return result === undefined ? defaultValue : result
}

export function omit(object, props) {
  const out = {}
  const propsDict = keyBy(props)
  for (let k in object) {
    if (!propsDict[k]) out[k] = object[k]
  }
  return out
}

export const getOrSelect = (obj, selector) => {
  if (typeof selector === 'function') {
    return selector(obj)
  }
  return get(obj, selector)
}