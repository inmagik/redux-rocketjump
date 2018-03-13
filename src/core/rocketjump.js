import { proxyObject, proxyReducer, arrayze } from '../utils'
import { makeActions } from './actions'
import { makeReducer } from './reducer'
import { makeSelectors } from './selectors'
import get from 'lodash.get'
import pick from 'lodash.pick'
import omit from 'lodash.omit'
import makeApiSaga from './apiSaga'

const rocketjumper = (rocketConfig = {}, rj) => (localConfig = {}) => {

  const config = { ...localConfig, ...rocketConfig }

  // All stuff to export
  let exp

  if (typeof rj === 'function') {
    // Call parent rocketjump **heres the magic** it can compose all the stuff
    exp = rj(omit(
      config,
      // Make the saga only at the end of all
      'api',
      // Prevent to re merge arrays
      'apiExtraParams',
      'successEffect',
      'failureEffect',
    ))
  } else {
    // Default export stuff
    exp = {
      actions: makeActions(config.type),

      selectors: makeSelectors(config.state),

      reducer: makeReducer(config.type, config.dataReducer),

      sideEffect: {
        apiExtraParams: [],
        successEffect: [],
        failureEffect: [],
      },
    }
  }

  // Proxy actions
  exp.actions = proxyObject(exp.actions, config.proxyActions)

  // Proxy reducer
  exp.reducer = proxyReducer(exp.reducer, config.proxyReducer)

  // Proxy selectors
  exp.selectors = proxyObject(exp.selectors, config.proxySelectors)

  // Describe the side effect
  const sideEffect = {
    ...exp.sideEffect,
    ...pick(config, [
      'callApi',
      'takeEffect',
      'takeEffectArgs',
    ]),
    apiExtraParams: [
      ...exp.sideEffect.apiExtraParams,
      ...arrayze(get(config, 'apiExtraParams', [])),
    ],
    successEffect: [
      ...exp.sideEffect.successEffect,
      ...arrayze(get(config, 'successEffect', [])),
    ],
    failureEffect: [
      ...exp.sideEffect.failureEffect,
      ...arrayze(get(config, 'failureEffect', [])),
    ],
  }

  if (typeof config.saga === 'function') {
    // Custom saga...
    exp.saga = config.saga()
  } else if (typeof config.api === 'function') {
    // Time 2 make real saga!
    exp.saga = makeApiSaga(
      config.type,
      config.api,
      sideEffect.apiExtraParams,
      sideEffect.takeEffect,
      sideEffect.callApi,
      sideEffect.successEffect,
      sideEffect.failureEffect,
      sideEffect.takeEffectArgs,
    )
  } else {
    // Pass down side effect descriptor
    exp.sideEffect = sideEffect
  }

  return exp
}

export default (rocketConfig = {}, rj) => {
  return rocketjumper(undefined, rocketjumper(rocketConfig, rj))
}
