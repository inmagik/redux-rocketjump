import {
  makeSideEffectDescriptor,
  addConfigToSideEffectDescritor,
} from './sideEffectDescriptor'
import { makeActions } from './actions'
import { proxyObject, proxyReducer } from 'rocketjump-core/utils'
import { makeReducer } from './reducer'
import { makeSelectors } from './selectors'
import { composeReducers } from './helpers'

// Make the exports
// take a config and a extended export (the return of this function)
export default (runConfig, jumpConfig, extendExport = {}) => {
  // Make side effect descriptor exports
  let sideEffect
  if (!extendExport.sideEffect) {
    // Create fresh seide effect descriptor
    sideEffect = makeSideEffectDescriptor()
  } else {
    // Use the side effect descriptor form extended exports
    sideEffect = extendExport.sideEffect
  }
  // Enanche side effect descriptor \w config
  sideEffect = addConfigToSideEffectDescritor(sideEffect, jumpConfig)

  // Make reducer
  let reducer
  if (!extendExport.reducer && runConfig.state !== false) {
    reducer = makeReducer(runConfig.type, jumpConfig.dataReducer)
  } else {
    reducer = extendExport.reducer
  }
  if (reducer) {
    if (jumpConfig.reducer) {
      reducer = proxyReducer(reducer, jumpConfig.reducer, runConfig)
    } else if (jumpConfig.proxyReducer) {
      reducer = proxyReducer(reducer, jumpConfig.proxyReducer, runConfig)
      console.warn(
        '[redux-rocketjump] DeprecationWarning: ' +
          'proxyReducer options is deprecated use reducer instead.'
      )
    }
    if (Array.isArray(jumpConfig.composeReducer)) {
      reducer = composeReducers(...[reducer].concat(jumpConfig.composeReducer))
    }
  }

  // Make actions
  let actions
  if (!extendExport.actions) {
    // Make fresh actions from config type
    actions = makeActions(runConfig.type)
  } else {
    // Use actions to extended export
    actions = extendExport.actions
  }
  // Proxy actions
  if (jumpConfig.actions) {
    actions = proxyObject(actions, jumpConfig.actions)
  } else if (jumpConfig.proxyActions) {
    console.warn(
      '[redux-rocketjump] DeprecationWarning: ' +
        'proxyActions options is deprecated use actions instead.'
    )
    actions = proxyObject(actions, jumpConfig.proxyActions)
  }

  // Make selectors
  let selectors
  if (!extendExport.selectors && runConfig.state !== false) {
    // Make fresh selectors by type
    selectors = makeSelectors(runConfig.state)
  } else {
    // Use selectors from exports
    selectors = extendExport.selectors
  }
  if (selectors) {
    if (jumpConfig.selectors) {
      selectors = proxyObject(selectors, jumpConfig.selectors)
    } else if (jumpConfig.proxySelectors) {
      selectors = proxyObject(selectors, jumpConfig.proxySelectors)
      console.warn(
        '[redux-rocketjump] DeprecationWarning: ' +
          'proxySelectors options is deprecated use selectors instead.'
      )
    }
  }

  const newExport = {
    ...extendExport,
    sideEffect,
    reducer,
    actions,
    selectors,
  }

  return newExport
}
