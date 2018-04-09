import get from 'lodash.get'
import pick from 'lodash.pick'
import { arrayze } from './utils'

export const makeSideEffectDescriptor = () => ({
  apiExtraParams: [],
  successEffect: [],
  failureEffect: [],
  mapSuccessAction: a => a,
  mapFailureAction: a => a,
  mapLoadingAction: a => a,
})

export const addConfigToSideEffectDescritor = (sideEffect, config) => ({
  ...sideEffect,
  ...pick(config, 'callApi', 'takeEffect', 'takeEffectArgs'),
  apiExtraParams: [
    ...sideEffect.apiExtraParams,
    ...arrayze(get(config, 'apiExtraParams', [])),
  ],
  successEffect: [
    ...sideEffect.successEffect,
    ...arrayze(get(config, 'successEffect', [])),
  ],
  failureEffect: [
    ...sideEffect.failureEffect,
    ...arrayze(get(config, 'failureEffect', [])),
  ],
  mapLoadingAction: typeof config.mapLoadingAction === 'function'
    ? a => config.mapLoadingAction(sideEffect.mapLoadingAction(a))
    : sideEffect.mapLoadingAction,
  mapSuccessAction: typeof config.mapSuccessAction === 'function'
    ? a => config.mapSuccessAction(sideEffect.mapSuccessAction(a))
    : sideEffect.mapSuccessAction,
  mapFailureAction: typeof config.mapFailureAction === 'function'
    ? a => config.mapFailureAction(sideEffect.mapFailureAction(a))
    : sideEffect.mapFailureAction,
})
