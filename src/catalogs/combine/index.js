import { fork } from 'redux-saga/effects'
import { createSelector } from 'reselect'
import { combineReducers } from 'redux'
import { getOrSelect } from '../../helpers'

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

export default (combine, config) => {

  const combined = Object.keys(combine).reduce((result, key) => {
    const givenRj = combine[key]

    const stateSelector = typeof givenRj.config.state === 'undefined'
      ? mergeStateKey(config.state, key)
      : givenRj.config.state

    const reducerKey = typeof givenRj.config.state === 'undefined'
      ? key
      : givenRj.config.state

    const {
      reducer,
      saga,
      actions,
      selectors,
    } = givenRj({
      state: stateSelector,
      callApi: givenRj.config.callApi || config.callApi,
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
        }
      }
    }
  }, {
    reducers: {},
    sagas: [],
    connect: {},
  })

  const { reducers, sagas, connect } = combined
  return {
    connect,
    reducer: combineReducers(reducers),
    saga: function *() {
      for (let i = 0; i < sagas.length; i++) {
        const saga = sagas[i]
        yield fork(saga)
      }
    },
  }
}
