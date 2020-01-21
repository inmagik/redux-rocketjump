import {
  makeSideEffectDescriptor,
  addConfigToSideEffectDescritor,
} from './sideEffectDescriptor'
import { makeActions, makeBuildableActions } from './actions'
import {
  proxyObject,
  proxyReducer,
  arrayze,
  invertKeys,
} from 'rocketjump-core/utils'
import { makeReducer } from './reducer'
import { makeSelectors } from './selectors'
import { composeReducers } from './helpers'
import { makeSelectorsWithMutations } from './mutations'

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
    if (
      typeof jumpConfig.composeReducer === 'function' ||
      Array.isArray(jumpConfig.composeReducer)
    ) {
      const composeReducer = arrayze(jumpConfig.composeReducer)
      reducer = composeReducers(...[reducer].concat(composeReducer))
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
  // Make buildable actions
  let buildableActions
  if (!extendExport.buildableActions) {
    // Make fresh buildableActions from config type
    buildableActions = makeBuildableActions(runConfig.type)
  } else {
    // Use buildableActions to extended export
    buildableActions = extendExport.buildableActions
  }
  // Proxy actions
  if (jumpConfig.actions) {
    actions = proxyObject(actions, jumpConfig.actions)
    buildableActions = proxyObject(buildableActions, jumpConfig.actions)
  } else if (jumpConfig.proxyActions) {
    console.warn(
      '[redux-rocketjump] DeprecationWarning: ' +
        'proxyActions options is deprecated use actions instead.'
    )
    actions = proxyObject(actions, jumpConfig.proxyActions)
    buildableActions = proxyObject(buildableActions, jumpConfig.proxyActions)
  }

  // Make selectors
  let selectors
  if (!extendExport.selectors && runConfig.state !== false) {
    // Make fresh selectors by type
    if (runConfig.mutations) {
      selectors = makeSelectorsWithMutations(
        runConfig.state,
        runConfig.mutations
      )
    } else {
      selectors = makeSelectors(runConfig.state)
    }
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

  // Default no computed
  let computed = null
  if (extendExport.computed) {
    // Continue the export
    computed = extendExport.computed
  }
  if (jumpConfig.computed) {
    // Merge given computed \w prev computed
    computed = { ...computed, ...invertKeys(jumpConfig.computed) }
  }

  const newExport = {
    ...extendExport,
    sideEffect,
    reducer,
    actions,
    buildableActions,
    selectors,
    computed,
  }

  return newExport
}
