import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { makeAppsReducers, rjMiddleware, makeAppsSaga } from 'redux-rocketjump'
import * as todos from './todos'

// Where i see it? hhehe eheh
const APPS = {
  todos,
}

const rootReducer = combineReducers({
  // HOOK for other reducers like redux-form...
  ...makeAppsReducers(APPS),
})

const mainSaga = makeAppsSaga(APPS)

const preloadedState = undefined
const sagaMiddleware = createSagaMiddleware()
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  rootReducer,
  preloadedState,
  composeEnhancers(applyMiddleware(sagaMiddleware, rjMiddleware))
)

sagaMiddleware.run(mainSaga)

export default store
