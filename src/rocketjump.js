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

export const rocketjump = (...configs) => (config = {}, extendExport) => {
  const allConfigs = [...configs, ...[config]]

  const mergedConfig = allConfigs.reduce((merged, config) => {
    if (typeof config === 'function') {
      return merged
    }
    return {
      ...merged,
      ...config,
    }
  }, {})

  invariant(
    mergedConfig.type,
    'You must specify a type key for actions and reducer'
  )
  invariant(
    mergedConfig.state,
    'You must specify a state key for create selectors'
  )

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
        ]),
        finalExport
      )
    }

    const exp =
      typeof finalExport === 'undefined'
        ? // Make the export for the first time
          {
            actions: makeActions(mergedConfig.type),
            reducer: makeReducer(mergedConfig.type, mergedConfig.dataReducer),
            selectors: makeSelectors(mergedConfig.state),
            sideEffect: makeSideEffectDescriptor(),
          }
        : // Continued to previous export
          { ...finalExport }

    exp.actions = proxyObject(exp.actions, config.proxyActions)
    exp.reducer = proxyReducer(exp.reducer, config.proxyReducer)
    exp.selectors = proxyObject(exp.selectors, config.proxySelectors)
    exp.sideEffect = addConfigToSideEffectDescritor(exp.sideEffect, config)

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
      sideEffect.takeEffectArgs
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
