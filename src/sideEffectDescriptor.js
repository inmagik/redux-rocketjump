import get from 'lodash.get'
import pick from 'lodash.pick'
import { arrayze } from 'rocketjump-core/utils'

export const makeSideEffectDescriptor = () => ({
  effectExtraParams: [],
  successEffect: [],
  failureEffect: [],
  unloadBy: [],
  mapSuccessAction: a => a,
  mapFailureAction: a => a,
  mapLoadingAction: a => a,
})

export const addConfigToSideEffectDescritor = (sideEffect, config) => {
  const nextSideEffectDescriptor = {
    ...sideEffect,
    ...pick(config, 'takeEffect', 'takeEffectArgs', 'needEffect'),
    successEffect: [
      ...sideEffect.successEffect,
      ...arrayze(get(config, 'successEffect', [])),
    ],
    failureEffect: [
      ...sideEffect.failureEffect,
      ...arrayze(get(config, 'failureEffect', [])),
    ],
    unloadBy: [...sideEffect.unloadBy, ...arrayze(get(config, 'unloadBy', []))],
    mapLoadingAction:
      typeof config.mapLoadingAction === 'function'
        ? a => config.mapLoadingAction(sideEffect.mapLoadingAction(a))
        : sideEffect.mapLoadingAction,
    mapSuccessAction:
      typeof config.mapSuccessAction === 'function'
        ? a => config.mapSuccessAction(sideEffect.mapSuccessAction(a))
        : sideEffect.mapSuccessAction,
    mapFailureAction:
      typeof config.mapFailureAction === 'function'
        ? a => config.mapFailureAction(sideEffect.mapFailureAction(a))
        : sideEffect.mapFailureAction,
  }

  if (config.effectCaller) {
    nextSideEffectDescriptor.effectCaller = config.effectCaller
  } else if (config.callApi) {
    nextSideEffectDescriptor.effectCaller = config.callApi
    console.warn(
      '[redux-rocketjump] DeprecationWarning: ' +
        'callApi options is deprecated use effectCaller instead.'
    )
  }

  if (config.effectExtraParams) {
    nextSideEffectDescriptor.effectExtraParams = [
      ...sideEffect.effectExtraParams,
      ...arrayze(get(config, 'effectExtraParams', [])),
    ]
  } else if (config.apiExtraParams) {
    nextSideEffectDescriptor.effectExtraParams = [
      ...sideEffect.effectExtraParams,
      ...arrayze(get(config, 'apiExtraParams', [])),
    ]
    console.warn(
      '[redux-rocketjump] DeprecationWarning: ' +
        'apiExtraParams options is deprecated use effectExtraParams instead.'
    )
  }

  return nextSideEffectDescriptor
}
