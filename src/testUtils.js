import rjMiddleware from './rjMiddleware'
import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'

export const createRealStoreWithSagaAndReducer = (
  saga,
  reducer,
  preloadedState
) => {
  const sagaMiddleware = createSagaMiddleware()
  const actions = []
  const actionLogMiddleware = store => next => action => {
    actions.push(action)
    return next(action)
  }
  const store = createStore(
    reducer,
    preloadedState,
    applyMiddleware(sagaMiddleware, rjMiddleware, actionLogMiddleware)
  )
  sagaMiddleware.run(saga)
  return [store, actions]
}

export const createMockStoreWithSaga = (saga, initialState) => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = [sagaMiddleware, rjMiddleware]
  const mockStore = configureStore(middlewares)
  const store = mockStore(initialState)
  sagaMiddleware.run(saga)
  return store
}
