import { fork } from 'redux-saga/effects'
import mapValues from 'lodash.mapvalues'
import { combineReducers } from 'redux'
import { getOrSelect } from '../../helpers'

const namespaceSelectors = (stateSelector, selectors) => {
  if (!stateSelector) {
    return selectors
  }
  const getPieceOfState = state => getOrSelect(state, stateSelector)
  return mapValues(selectors, selector =>
    state => selector(getPieceOfState(state))
  )
}

export default (combine, config) => {

  const combined = Object.keys(combine).reduce((result, key) => {
    const givenRj = combine[key]
    // const stateKey = typeof givenRj.config.state === 'undefined'
    //   ? key
    //   : givenRj.config.state
    const stateKey = givenRj.config.state ||  key
    const {
      reducer,
      saga,
      actions,
      selectors: baseSelectors,
    } = givenRj({
      state: stateKey,
      callApi: givenRj.config.callApi || config.callApi,
      // apiExtraParams: config.apiExtraParams,
      // successEffect: config.successEffect,
      // failureEffect: config.failureEffect,
    })
    const selectors = namespaceSelectors(config.state, baseSelectors)

    // let reducers = result.reducers

    return {
      reducers: {
        ...result.reducers,
        [stateKey]: reducer,
      },
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
