import invariant from 'invariant'
import { forgeRocketJump } from 'rocketjump-core'
import pick from 'lodash.pick'
import { resetReducerOn } from './helpers'
import makeExport from './export'
import { $TYPE_RJ_RUN_CONFIG, $TYPE_RJ_COMBINE_CONFIG } from './internals'
import makeApiSaga from './apiSaga'

function checkWarns(rjsOrConfigs, extraConfig) {
  if (
    extraConfig &&
    // The last config can be called from rocketjump itself
    // or frome the special combineRjs GAnG!
    extraConfig.__rjtype !== $TYPE_RJ_RUN_CONFIG &&
    extraConfig.__rjtype !== $TYPE_RJ_COMBINE_CONFIG
  ) {
    console.warn(
      '[redux-rocketjump] DeprecationWarning: ' +
        'the last evalutation should invoke without parameters'
    )
  }
  let cfgToCheck = rjsOrConfigs.filter(
    item => typeof item === 'object' && item !== null
  )
  if (
    extraConfig === undefined ||
    // Only combineRjs can inject the last config :P
    // So for it skip the check for given extra conf
    extraConfig.__rjtype === $TYPE_RJ_COMBINE_CONFIG
  ) {
    cfgToCheck = cfgToCheck.slice(0, cfgToCheck.length - 1)
  }
  cfgToCheck.forEach(config => {
    if (config.type || config.api || config.state || config.effect) {
      console.warn(
        '[redux-rocketjump] DeprecationWarning: ' +
          'type, effect and state should be defined only once, in the last object'
      )
    }
  })
}

function makeRunConfig(finalConfig) {
  // Detected the run config from partial rjs + configs
  // pick only: state, type and api
  const runConfig = pick(finalConfig, ['state', 'api', 'type', 'effect'])
  // Mark as a run config
  Object.defineProperty(runConfig, '__rjtype', {
    value: $TYPE_RJ_RUN_CONFIG,
  })

  // Check for type and state to be required in run config
  invariant(
    runConfig.type,
    'You must specify a type key for actions and reducer'
  )
  invariant(
    runConfig.state !== undefined,
    'You must specify a state key for create selectors' +
      ', if you want to omit the state creation set state explice to false.'
  )

  return runConfig
}

function makeRecursionRjs(
  partialRjsOrConfigs,
  extraConfig,
  isLastRjInvocation
) {
  if (process.env.NODE_ENV !== 'production') {
    checkWarns(partialRjsOrConfigs, extraConfig)
  }
  if (extraConfig) {
    return partialRjsOrConfigs.concat(extraConfig)
  }
  return partialRjsOrConfigs
}

function finalizeExport(finalExport, runConfig, finalConfig) {
  // ~~ END OF CHAIN RECURSION ~~
  let { sideEffect, __rjtype, reducer, ...rjExport } = finalExport

  // Use the curried-combined-merged side effect descriptor
  // to create the really side effect the "saga" generator
  // .. or use a custom saga .. old quiet unused rj api ...
  let saga
  if (typeof finalConfig.saga === 'function') {
    // Make custom saga...
    saga = finalConfig.saga(
      pick(finalConfig, [
        'type',
        'state',
        'api',
        'effect',
        'effectExtraParams',
        'apiExtraParams',
        'takeEffect',
        'effectCaller',
        'callApi',
        'successEffect',
        'failureEffect',
        'takeEffectArgs',
      ])
    )
  } else {
    let effectCall
    if (runConfig.effect) {
      effectCall = runConfig.effect
    } else if (runConfig.api) {
      effectCall = runConfig.api
      console.warn(
        '[redux-rocketjump] DeprecationWarning: ' +
          'api options is deprecated use effect instead.'
      )
    }

    // Make saga using api and merged side effect descriptor!
    saga = makeApiSaga(
      runConfig.type,
      effectCall,
      sideEffect.effectExtraParams,
      sideEffect.takeEffect,
      sideEffect.effectCaller,
      sideEffect.needEffect,
      sideEffect.successEffect,
      sideEffect.failureEffect,
      sideEffect.takeEffectArgs,
      sideEffect.mapLoadingAction,
      sideEffect.mapSuccessAction,
      sideEffect.mapFailureAction,
      sideEffect.unloadBy
    )
  }

  if (reducer && sideEffect.unloadBy.length > 0) {
    // Enhance reducer \w reset only when configurated unloadBy action
    // and reducer is not undefined (rj \w state false)
    // This should apply at very very last to guarantee the correct
    // initial state
    reducer = resetReducerOn(sideEffect.unloadBy, reducer)
  }

  // Finally the rocketjump is created!
  // { actions: {}, selectors: {}, saga, reducer }
  return {
    ...rjExport,
    reducer,
    saga,
  }
}

export const rj = forgeRocketJump({
  family: Symbol('rj~REDUX'),
  makeRunConfig,
  makeRecursionRjs,
  makeExport,
  finalizeExport,
})
