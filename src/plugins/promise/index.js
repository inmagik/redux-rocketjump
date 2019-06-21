import omit from 'lodash.omit'
import { rj } from '../../rocketjump'

const isReactNative =
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

export default rj({
  mapLoadingAction: a => ({
    ...a,
    meta: omit(a.meta, 'thunk'),
  }),
  actions: {
    load: ({ load }) => (params = {}, meta = {}) =>
      load(params, { ...meta, thunk: isReactNative ? {} : true }),
  },
})
