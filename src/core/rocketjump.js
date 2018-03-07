import { proxyObject, proxyReducer } from '../utils'
import { makeActions } from './actions'
import { makeReducer } from './reducer'
import { makeSelectors } from './selectors'
import makeApiSaga from './apiSaga'

const rocketjumper = (rocketConfig = {}, rj) => (localConfig = {}) => {

  const config = { ...localConfig, ...rocketConfig }

  // All stuff to export
  const exp = typeof rj === 'function' ? rj(config) : {

    actions: makeActions(config.type),

    selectors: makeSelectors(config.state),

    reducer: makeReducer(config.type, config.dataReducer),

  }

  // Proxy actions
  exp.actions = proxyObject(exp.actions, config.proxyActions)

  // Proxy reducer
  exp.reducer = proxyReducer(exp.reducer, config.proxyReducer)

  // Proxy selectors
  exp.selectors = proxyObject(exp.selectors, config.proxySelectors)

  if (typeof config.saga === 'function') {
    // Custom saga...
    exp.saga = config.saga()
  } else if (typeof config.api === 'function') {
    exp.saga = makeApiSaga(
      config.type,
      config.api,
      config.apiExtraParams,
      config.takeEffect,
      config.callApi,
      config.successEffect,
      config.failureEffect
    )
  }

  return exp
}

export default (rocketConfig = {}, rj) => {
  return rocketjumper(undefined, rocketjumper(rocketConfig, rj))
}
