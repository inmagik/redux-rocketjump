import invariant from 'invariant'
import pick from 'lodash.pick'
import { proxyObject, proxyReducer } from './utils'
import { makeActions } from './actions'
import { makeReducer } from './reducer'
import { makeSelectors } from './selectors'
import {
  makeSideEffectDescriptor,
  addConfigToSideEffectDescritor,
} from './sideEffectDescriptor'
import omit from 'lodash.omit'
import makeApiSaga from './apiSaga'

const rocketjump = (...configs) => {
  const jumpConfig = configs.reduce((merged, config) => {
    if (typeof config === 'function') {
      return merged
    }
    return {
      ...merged,
      ...config,
    }
  }, {})

  const jumper = (config = {}, extendExport) => {
    const allConfigs = [...configs, ...[config]]
    const mergedConfig = { ...jumpConfig, ...config }

    invariant(
      mergedConfig.type,
      'You must specify a type key for actions and reducer'
    )
    // invariant(
    //   typeof mergedConfig.state !== 'undefined',
    //   'You must specify a state key for create selectors' +
    //   ', if you want to omit the state creation set state explice to false.'
    // )

    const finalExport = allConfigs.reduce((finalExport, config, i) => {
      // When config is a function is intendeed to be a rocketjump!
      if (typeof config === 'function') {
        return config(
          omit(mergedConfig, [
            'api',
            'callApi',
            'apiExtraParams',
            'successEffect',
            'failureEffect',
            'proxySelectors',
            'proxyActions',
            'proxyReducer',
            'mapLoadingAction',
            'mapSuccessAction',
            'mapFailureAction',
          ]),
          finalExport
        )
      }

      const exp =
        typeof finalExport === 'undefined'
          ? // Make the export for the first time
            {
              sideEffect: makeSideEffectDescriptor(),
              actions: makeActions(mergedConfig.type),
              reducer: makeReducer(mergedConfig.type, mergedConfig.dataReducer),
              selectors: makeSelectors(mergedConfig.state),
              // reducer: mergedConfig.state === false
              //   ? undefined
              //   : makeReducer(mergedConfig.type, mergedConfig.dataReducer),
              // selectors: mergedConfig.state === false
              //  ? undefined
              //  : makeSelectors(mergedConfig.state),
            }
          : // Continued to previous export
            { ...finalExport }

      exp.sideEffect = addConfigToSideEffectDescritor(exp.sideEffect, config)
      exp.actions = proxyObject(exp.actions, config.proxyActions)
      exp.reducer = proxyReducer(exp.reducer, config.proxyReducer)
      exp.selectors = proxyObject(exp.selectors, config.proxySelectors)
      // exp.reducer = typeof exp.reducers === 'undefined'
      //   ? undefined
      //   : proxyReducer(exp.reducer, config.proxyReducer)
      // exp.selectors = typeof exp.selectors
      //   ? undefined
      //   : proxyObject(exp.selectors, config.proxySelectors)

      return exp
    }, extendExport)

    if (typeof mergedConfig.saga === 'function') {
      // Custom saga...
      const saga = mergedConfig.saga(
        pick(mergedConfig, [
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
      return {
        ...omit(finalExport, 'sideEffect'),
        saga,
      }
    } else if (typeof mergedConfig.api === 'function') {
      // Time 2 make real saga!
      const { sideEffect } = finalExport
      const saga = makeApiSaga(
        mergedConfig.type,
        mergedConfig.api,
        sideEffect.apiExtraParams,
        sideEffect.takeEffect,
        sideEffect.callApi,
        sideEffect.successEffect,
        sideEffect.failureEffect,
        sideEffect.takeEffectArgs,
        sideEffect.mapLoadingAction,
        sideEffect.mapSuccessAction,
        sideEffect.mapFailureAction,
      )
      return {
        ...omit(finalExport, 'sideEffect'),
        saga,
      }
    } else {
      // Pass down side effect descriptor
      return finalExport
    }
  }

  // Attach current rj config to returned fn
  // ... is only js ...
  jumper.config = jumpConfig

  return jumper
}

export { rocketjump as rj }
