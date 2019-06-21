import { fork } from 'redux-saga/effects'
import { createSelector } from 'reselect'
import { combineReducers } from 'redux'
import { getOrSelect } from './helpers'
import { $TYPE_RJ_COMBINE_CONFIG } from './internals'

const mergeStateKey = (baseStateSelector, subStateSelector) => {
  // No base state to merge
  if (
    typeof baseStateSelector !== 'string' &&
    typeof baseStateSelector !== 'function'
  ) {
    return subStateSelector
  }
  return createSelector(
    state => getOrSelect(state, baseStateSelector),
    baseState => getOrSelect(baseState, subStateSelector)
  )
}

export default function combineRjs(combine, config) {
  const combined = Object.keys(combine).reduce(
    (result, key) => {
      const givenRj = combine[key]

      const stateSelector =
        typeof givenRj.__rjconfig.state === 'undefined'
          ? mergeStateKey(config.state, key)
          : givenRj.__rjconfig.state

      const reducerKey =
        typeof givenRj.__rjconfig.state === 'undefined' ? key : givenRj.__rjconfig.state

      const { reducer, saga, actions, selectors } = givenRj({
        __rjtype: $TYPE_RJ_COMBINE_CONFIG,
        state: stateSelector,
        callApi: givenRj.__rjconfig.callApi || config.callApi,
        // apiExtraParams: config.apiExtraParams,
        // successEffect: config.successEffect,
        // failureEffect: config.failureEffect,
      })

      let reducers = result.reducers
      if (typeof reducer !== 'undefined') {
        reducers = {
          ...result.reducers,
          [reducerKey]: reducer,
        }
      }

      return {
        reducers,
        sagas: result.sagas.concat(saga),
        connect: {
          ...result.connect,
          [key]: {
            selectors,
            actions,
          },
        },
      }
    },
    {
      reducers: {},
      sagas: [],
      connect: {},
    }
  )

  const { reducers, sagas, connect } = combined
  return {
    connect,
    reducer: combineReducers(reducers),
    saga: function*() {
      for (let i = 0; i < sagas.length; i++) {
        const saga = sagas[i]
        yield fork(saga)
      }
    },
  }
}