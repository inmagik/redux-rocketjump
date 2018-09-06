import { rj } from '../../rocketjump'
import { makeSelectors } from '../../selectors'
import { select } from 'redux-saga/effects'
export default (cacheConfig = {}) => (config, ...args) => rj({
  proxyActions: {
    load: ({ load }) => (params = {}, meta = {}) =>
      load(params, { ...meta, cache: true }),

    // Skip cache
    loadForce: ({ load }) => load,
  },
  needEffect: function *(meta) {
    if (!meta.cache) {
      return true
    }
    const { getData } = makeSelectors(config.state)
    const data = yield select(getData)
    return data === null
  }
})(config, ...args)
