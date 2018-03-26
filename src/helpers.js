import { fork } from 'redux-saga/effects'
import some from 'lodash.some'
import { arrayze } from './utils'

export const composeReducers = (...reducers) => (prevState, action) =>
  reducers.reduce((nextState, reducer) => {
    if (typeof prevState === 'undefined') {
      // When le fukin prevState is undefined merge reducers
      // initial states... Cekka
      return { ...nextState, ...reducer(undefined, action) }
    } else {
      return reducer(nextState, action)
    }
  }, prevState)

// Hight Order Reducer for reset a piece of state on certain actions
export const resetReducerOn = (matchTypes, reducer) => {
  // Match fn
  const match = action =>
    some(arrayze(matchTypes), matchType => {
      // TODO: Implement more option for matching type from outside!
      return matchType === action.type
    })

  return (previousState, action) => {
    // Match action! Reset this piece of state
    if (match(action)) {
      return reducer(undefined, action)
    }
    return reducer(previousState, action)
  }
}

export const makeAppsReducers = apps => {
  return Object.keys(apps).reduce((allReducers, appName) => {
    const reducer = apps[appName].reducer
    if (typeof reducer === 'undefined') {
      return allReducers
    }
    return {
      ...allReducers,
      ...(typeof reducer === 'function' ? { [appName]: reducer } : reducer),
    }
  }, {})
}

export const makeAppsSaga = apps => {
  return function*() {
    // Young Gio Va = P
    const appsNames = Object.keys(apps)
    for (let i = 0; i < appsNames.length; i++) {
      const saga = apps[appsNames[i]].saga
      if (typeof saga !== 'undefined') {
        yield fork(saga)
      }
    }
  }
}
