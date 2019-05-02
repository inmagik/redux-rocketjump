import { $TYPE_RJ_EXPORT, $TYPE_RJ_PARTIAL } from './internals'

// Simple merge and skip when function....
function mergeConfigs(rjsOrConfigs) {
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

// rj(
//   rj({}), rj()
// )
// //(reduxRocketjumpImpl)
//
// rj(
//   rj({}), rj()
// )
// //(reactRocketjumpImpl)

const noop = () => {}

// Forge a rocketjump from in da S T E L L
export function forgeRocketJump(rjImpl, extendsPartialRj = noop) {

  // Here is where the magic starts the functional recursive rjs combining \*.*/
  function rj(...partialRjsOrConfigs) {
    // ... make the partial config
    const partialConfig = mergeConfigs(partialRjsOrConfigs)

    // Make the partial rj
    function PartialRj(extraConfig, extendExportArg, runRjImpl = rjImpl) {

      // Take the extended exports seriusly only when came from rj
      let extendExport
      if (
        typeof extendExportArg === 'object' &&
        extendExportArg.__rjtype === $TYPE_RJ_EXPORT
      ) {
        extendExport = extendExportArg
      }

      // true when rj(rj(), rj(), rj(), { })() the last rj of recursion is
      // evalutated
      const isLastRjInvocation = extendExport === undefined

      // Final configuration
      const finalConfig = mergeConfigs([partialConfig, extraConfig])

      const runConfig = runRjImpl.makeRunConfig(finalConfig)
      const recursionRjs = runRjImpl.makeRecursionRjs(partialRjsOrConfigs, extraConfig, isLastRjInvocation)


      // Make the continued export for combining
      let continuedExport
      if (!extendExport) {
        continuedExport = {}
        // Mark export as valid
        Object.defineProperty(continuedExport, '__rjtype', {
          value: $TYPE_RJ_EXPORT,
        })
      } else {
        continuedExport = extendExport
      }

      // Invoke all rjs and configs and merge returned exports
      // ... yeah a mindfuck but is coool. ..
      const finalExport = recursionRjs.reduce((combinedExport, rjOrConfig) => {
        if (typeof rjOrConfig === 'function') {
          // Is a partial rj jump it!
          return rjOrConfig(runConfig, combinedExport, runRjImpl)
        } else {
          // Is a config ... run config + jump config = export
          return runRjImpl.makeExport(runConfig, rjOrConfig, combinedExport)
        }
      }, continuedExport)

      if (isLastRjInvocation) {
        return runRjImpl.finalizeExport(finalExport, runConfig, finalConfig)
      } else {
        return finalExport
      }


      // rjImple.mergeConfi()
      // rjImple.makeExport()
      // const runConfig = {}

      // const finalExport = partialRjsOrConfigs.reduce((combinedExport, rjOrConfig) => {
      //   if (typeof rjOrConfig === 'function') {
      //     // Is a partial rj jump it!
      //     return rjOrConfig(runConfig, combinedExport)
      //   } else {
      //     // Is a config ... run config + jump config = export
      //     return makeExport(runConfig, rjOrConfig, combinedExport)
      //   }
      // }, { ...extendExport, __rjtype: $TYPE_RJ })

    }

    extendsPartialRj(PartialRj)

    // Mark the partialRj
    Object.defineProperty(PartialRj, '__rjtype', { value: $TYPE_RJ_PARTIAL })

    PartialRj.config = partialConfig

    return PartialRj

      // ... curry the other partial rjs + configs

      // ... make the partial config
      // const partialConfig = mergeRjsOrConfigs(rjsOrConfigs)

    }

    // Object.defineProperty(rj, '__internalImpl', { value: rjImpl })

    return rj

    // PartialRj.sayHello

    // PartialRj.23 = ()

    // const partialRj = (extraConfig, extendExportArg) => {
    //   let extendExport
    //   // Take the extended exports seriusly only when came from rj
    //   if (typeof extendExportArg === 'object' && extendExportArg.__rjtype === $TYPE_RJ) {
    //     extendExport = extendExportArg
    //   }
    //
    //   // Check warns from all params...
    //   if (process.env.NODE_ENV !== 'production') {
    //     checkWarns(rjsOrConfigs, extraConfig)
    //   }
    //
    //   // Add the extra given config
    //   if (extraConfig) {
    //     // Add to the list of rjs and config...
    //     rjsOrConfigs.push(extraConfig)
    //   }
    //
    //   // Final configuration
    //   const finalConfig = mergeRjsOrConfigs([partialConfig, extraConfig])
    //
    //   // Detected the run config from partial rjs + configs
    //   // pick only: state, type and api
    //   const runConfig = pick(finalConfig, ['state', 'api', 'type'])
    //   // Add $TYPE_RJ type
    //   runConfig.__rjtype = $TYPE_RJ
    //
    //   // Check for type and state to be required in run config
    //   invariant(
    //     runConfig.type,
    //     'You must specify a type key for actions and reducer'
    //   )
    //   invariant(
    //     runConfig.state !== undefined,
    //     'You must specify a state key for create selectors' +
    //     ', if you want to omit the state creation set state explice to false.'
    //   )
    //
    //   // Invoke all rjs and configs and merge returned exports
    //   // ... yeah a mindfuck but is coool. ..
    //   const finalExport = rjsOrConfigs.reduce((combinedExport, rjOrConfig) => {
    //     if (typeof rjOrConfig === 'function') {
    //       // Is a partial rj jump it!
    //       return rjOrConfig(runConfig, combinedExport)
    //     } else {
    //       // Is a config ... run config + jump config = export
    //       return makeExport(runConfig, rjOrConfig, combinedExport)
    //     }
    //   }, { ...extendExport, __rjtype: $TYPE_RJ })
    //
    //   // when extendExport is undefined we really "create" the export
    //   // (otherewise the rj is using to extending another rj...)
    //   // so basically this means that we can create the saga from
    //   // the side effect descriptor
    //   if (extendExport === undefined) {
    //     // ~~ END OF CHAIN RECURSION ~~
    //     let { sideEffect, __rjtype, reducer, ...rjExport } = finalExport
    //
    //     // Use the curried-combined-merged side effect descriptor
    //     // to create the really side effect the "saga" generator
    //     // .. or use a custom saga .. old quiet unused rj api ...
    //     let saga
    //     if (typeof finalConfig.saga === 'function') {
    //       // Make custom saga...
    //       saga = finalConfig.saga(
    //         pick(finalConfig, [
    //           'type',
    //           'state',
    //           'api',
    //           'apiExtraParams',
    //           'takeEffect',
    //           'callApi',
    //           'successEffect',
    //           'failureEffect',
    //           'takeEffectArgs',
    //         ])
    //       )
    //     } else {
    //       // Make saga using api and merged side effect descriptor!
    //       saga = makeApiSaga(
    //         runConfig.type,
    //         runConfig.api,
    //         sideEffect.apiExtraParams,
    //         sideEffect.takeEffect,
    //         sideEffect.callApi,
    //         sideEffect.needEffect,
    //         sideEffect.successEffect,
    //         sideEffect.failureEffect,
    //         sideEffect.takeEffectArgs,
    //         sideEffect.mapLoadingAction,
    //         sideEffect.mapSuccessAction,
    //         sideEffect.mapFailureAction,
    //         sideEffect.unloadBy,
    //       )
    //     }
    //
    //     if (reducer && sideEffect.unloadBy.length > 0) {
    //       // Enhance reducer \w reset only when configurated unloadBy action
    //       // and reducer is not undefined (rj \w state false)
    //       // This should apply at very very last to guarantee the correct
    //       // initial state
    //       reducer = resetReducerOn(sideEffect.unloadBy, reducer)
    //     }
    //
    //     // Finally the rocketjump is created!
    //     // { actions: {}, selectors: {}, saga, reducer }
    //     return {
    //       ...rjExport,
    //       reducer,
    //       saga
    //     }
    //   } else {
    //     // ... Continue the recursion :D
    //     return finalExport
    //   }
    // }

    // Attach current rj config to returned partial rj fn
    // ... is only js ...
    // partialRj.config = partialConfig

    // return partialRj
  // }

}
