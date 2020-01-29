import { combineReducers } from 'redux'
import { enhanceReducer, makeMutationsReducer } from './reducer'
import { enhancePlainActions, enhanceBuildableActions } from './actions'
import { enhanceSaga } from './saga'
import { hasMutationsConfigSomeState } from './utils'
import { createComputeStateWithMutations } from './computed'

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

  const {
    reducer,
    actions,
    buildableActions,
    saga,
    computeState,
  } = rjObjectExport

  const { sideEffect, computed } = mergedExport

  const hasMutationState = hasMutationsConfigSomeState(mutations)

  // Add mutations updaterZ to basic reducer
  const enhancedReducer = enhanceReducer(mutations, reducer, actions, runConfig)

  let withMutationsReducer
  if (hasMutationState) {
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

  let withMutationsComputeState
  if (!hasMutationState || !computeState) {
    // Mutations don't have state at all or no computed
    // are provided in conf so use the given computeState
    withMutationsComputeState = computeState
  } else {
    withMutationsComputeState = createComputeStateWithMutations(
      computed,
      mutations
    )
  }

  return {
    ...rjObjectExport,
    reducer: withMutationsReducer,
    computeState: withMutationsComputeState,
    actions: enhancePlainActions(mutations, actions, runConfig),
    buildableActions: enhanceBuildableActions(
      mutations,
      buildableActions,
      runConfig
    ),
    saga: enhanceSaga(mutations, saga, sideEffect, runConfig),
  }
}

export { makeSelectorsWithMutations } from './selectors'
