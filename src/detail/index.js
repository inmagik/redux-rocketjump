import { rocketjump, makeActions } from '../core'

export const makeDetailActions = type => {
  const { load, unload } = makeActions(type)

  const loadDetail = (id, params = {}, meta = {}) =>
    load({ ...params, id }, { ...meta, id })

  return {
    load: loadDetail,
    unload,
  }
}

export const makeDetail = rocketjump({
  proxyActions: {
    load: ({ load }) => (id, params = {}, meta = {}) =>
      load({ ...params, id }, { ...meta, id }),
  },
})
