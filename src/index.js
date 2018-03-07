import { fork } from 'redux-saga/effects'

export { composeReducers, resetReducerOn } from './utils'
export * from './effects'
export * from './core'
export * from './list'
export * from './detail'
export * from './delete'

export const makeAppsReducers = (apps) => {
  return Object.keys(apps)
    .reduce((allReducers, appName) => {
      const reducer = apps[appName].reducer
      if (typeof reducer === 'undefined') {
        return allReducers
      }
      return {
        ...allReducers,
        ...(
          typeof reducer === 'function'
            ? { [appName]: reducer }
            : reducer
        ),
      }
    }, {})
}

export const makeAppsSaga = (apps) => {
  return function* () {
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
