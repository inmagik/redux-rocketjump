import get from 'lodash.get'
import pick from 'lodash.pick'
import { arrayze } from '../utils'

export const makeSideEffectDescriptor = () => ({
  apiExtraParams: [],
  successEffect: [],
  failureEffect: [],
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
})
