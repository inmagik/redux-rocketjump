import invariant from 'invariant'
import makeExport from './export'
import makeApiSaga from './apiSaga'
import pick from 'lodash.pick'
import { resetReducerOn } from './helpers'
import { $TYPE_RJ, $TYPE_COMBINE_RJ } from './internals'

// Simple merge and skip when function....
function mergeRjsOrConfigs(rjsOrConfigs) {
  return rjsOrConfigs.reduce((finalConfig, config) => {
    if (typeof config === 'function') {
      return finalConfig
    }
    return {
      ...finalConfig,
      ...config,
    }
  }, {})
}

function checkWarns(rjsOrConfigs, extraConfig) {
  if (
    extraConfig &&
    // The last config can be called from rocketjump itself
    // or frome the special combineRjs GAnG!
    extraConfig.__rjtype !== $TYPE_RJ &&
    extraConfig.__rjtype !== $TYPE_COMBINE_RJ
  ) {
    console.warn(
      '[redux-rocketjump] DeprecationWarning: ' +
      'the last evalutation should invoke without parameters'
    )
  }
  let cfgToCheck = rjsOrConfigs.filter(item => typeof item === 'object')
  if (
    extraConfig === undefined ||
    // Only combineRjs can inject the last config :P
    // So for it skip the check for given extra conf
    extraConfig.__rjtype === $TYPE_COMBINE_RJ
  ) {
    cfgToCheck = cfgToCheck.slice(0, cfgToCheck.length - 1)
  }
  cfgToCheck.forEach(config => {
    if (config.type || config.api || config.state) {
      console.warn(
        '[redux-rocketjump] DeprecationWarning: ' +
        'type, api and state should be defined only once, in the last object'
      )
    }
  })
}

// Here is where the magic starts the functional recursive rjs combining \*.*/
export function rj (...args) {
  // Make the partial rj
  // ... curry the other partial rjs + configs
  let rjsOrConfigs = [...args]
  // ... make the partial config
  const partialConfig = mergeRjsOrConfigs(rjsOrConfigs)

  const partialRj = (extraConfig, extendExportArg) => {
    let extendExport
    // Take the extended exports seriusly only when came from rj
    if (typeof extendExportArg === 'object' && extendExportArg.__rjtype === $TYPE_RJ) {
      extendExport = extendExportArg
    }

    // Check warns from all params...
    if (process.env.NODE_ENV !== 'production') {
      checkWarns(rjsOrConfigs, extraConfig)
    }

    // Add the extra given config
    if (extraConfig) {
      // Add to the list of rjs and config...
      rjsOrConfigs.push(extraConfig)
    }

    // Final configuration
    const finalConfig = mergeRjsOrConfigs([partialConfig, extraConfig])

    // Detected the run config from partial rjs + configs
    // pick only: state, type and api
    const runConfig = pick(finalConfig, ['state', 'api', 'type'])
    // Add $TYPE_RJ type
    runConfig.__rjtype = $TYPE_RJ

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

    // Invoke all rjs and configs and merge returned exports
    // ... yeah a mindfuck but is coool. ..
    const finalExport = rjsOrConfigs.reduce((combinedExport, rjOrConfig) => {
      if (typeof rjOrConfig === 'function') {
        // Is a partial rj jump it!
        return rjOrConfig(runConfig, combinedExport)
      } else {
        // Is a config ... run config + jump config = export
        return makeExport(runConfig, rjOrConfig, combinedExport)
      }
    }, { ...extendExport, __rjtype: $TYPE_RJ })

    // when extendExport is undefined we really "create" the export
    // (otherewise the rj is using to extending another rj...)
    // so basically this means that we can create the saga from
    // the side effect descriptor
    if (extendExport === undefined) {
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
            'apiExtraParams',
            'takeEffect',
            'callApi',
            'successEffect',
            'failureEffect',
            'takeEffectArgs',
          ])
        )
      } else {
        // Make saga using api and merged side effect descriptor!
        saga = makeApiSaga(
          runConfig.type,
          runConfig.api,
          sideEffect.apiExtraParams,
          sideEffect.takeEffect,
          sideEffect.callApi,
          sideEffect.needEffect,
          sideEffect.successEffect,
          sideEffect.failureEffect,
          sideEffect.takeEffectArgs,
          sideEffect.mapLoadingAction,
          sideEffect.mapSuccessAction,
          sideEffect.mapFailureAction,
          sideEffect.unloadBy,
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
        saga
      }
    } else {
      // ... Continue the recursion :D
      return finalExport
    }
  }

  // Attach current rj config to returned partial rj fn
  // ... is only js ...
  partialRj.config = partialConfig

  return partialRj
}
