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
    reducer = proxyReducer(reducer, jumpConfig.proxyReducer)
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
  actions = proxyObject(actions, jumpConfig.proxyActions)

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
    selectors = proxyObject(selectors, jumpConfig.proxySelectors)
  }

  const newExport = {
    ...extendExport,
    sideEffect,
    reducer,
    actions,
    selectors,
  }

  Object.defineProperty(newExport, '__rjtype', {
    // RAVER FOLLE 23
    value: extendExport.__rjtype,
  })

  return newExport
}
