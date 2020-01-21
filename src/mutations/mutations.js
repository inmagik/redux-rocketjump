import { combineReducers } from 'redux'
import { makeSelectors } from '../selectors'
import { getOrSelect } from '../helpers'
import { enhanceReducer, makeMutationsReducer } from './reducer'
import { enhancePlainActions, enhanceBuildableActions } from './actions'
import { enhanceSaga } from './saga'
import { hasMutationState } from './helpers'

export function makeSelectorsWithMutations(stateSelector, mutations) {
  if (hasMutationState(mutations)) {
    let namespacedStateSelector
    if (typeof stateSelector === 'function') {
      namespacedStateSelector = state => stateSelector(state).root
    } else {
      namespacedStateSelector = `${stateSelector}.root`
    }
    const baseSelectors = makeSelectors(namespacedStateSelector)
    const getParentBaseState = state => getOrSelect(state, stateSelector)
    const getMutationsState = state =>
      getOrSelect(state, stateSelector).mutations
    return {
      ...baseSelectors,
      getParentBaseState,
      getMutationsState,
    }
  } else {
    return makeSelectors(stateSelector)
  }
}

export function enhanceMakeRunConfigWithMutations(runConfig, finalConfig) {
  // Set mutations in run config
  if (finalConfig.mutations) {
    return {
      ...runConfig,
      mutations: finalConfig.mutations,
    }
  }
  return runConfig
}

export function enhanceFinalExportWithMutations(
  rjObjectExport,
  mergedExport,
  runConfig
) {
  // NOTE grab the mutations config from run config
  // because we need to HACK selectors before create them the first time
  // so all the recursion point to [root] mutations key
  const { mutations } = runConfig

  // No Mutations
  if (!runConfig.mutations) {
    return rjObjectExport
  }

  const { reducer, actions, buildableActions, saga } = rjObjectExport

  const { sideEffect } = mergedExport

  // Add mutations updaterZ to basic reducer
  const enhancedReducer = enhanceReducer(mutations, reducer, actions, runConfig)

  let withMutationsReducer
  if (hasMutationState(mutations)) {
    const mutationsReducer = makeMutationsReducer(
      mutations,
      runConfig,
      sideEffect.unloadBy
    )
    withMutationsReducer = combineReducers({
      root: enhancedReducer,
      mutations: mutationsReducer,
    })
  } else {
    withMutationsReducer = enhancedReducer
  }

  return {
    ...rjObjectExport,
    reducer: withMutationsReducer,
    actions: enhancePlainActions(mutations, actions, runConfig),
    buildableActions: enhanceBuildableActions(
      mutations,
      buildableActions,
      runConfig
    ),
    saga: enhanceSaga(mutations, saga, sideEffect, runConfig),
  }
}
