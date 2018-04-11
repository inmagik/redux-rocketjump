import omit from 'lodash.omit'
import { rj } from '../../rocketjump'

export default rj({
  mapLoadingAction: a => ({
    ...a,
    meta: omit(a.meta, 'thunk'),
  }),
  proxyActions: {
    load: ({ load }) => (params = {}, meta = {}) =>
      load(params, { ...meta, thunk: true  })
  }
})
