import { createStore, applyMiddleware } from 'redux'
import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'

export const mockStoreWithSaga = (saga, ...mockStoreArgs) => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = [sagaMiddleware]
  const mockStore = configureStore(middlewares)
  const store = mockStore(...mockStoreArgs)
  sagaMiddleware.run(saga)
  return store
}

export const createRealStoreWithSagaAndReducer = (saga, reducer, preloadedState) => {
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(
    reducer,
    preloadedState,
    applyMiddleware(sagaMiddleware),
  )
  sagaMiddleware.run(saga)
  return store
}

// FIXME: Fuck off i only want to have an util file for tests IN THIS FOLDER
// this is the only way to prevent jest to get angry...
test(`O.o`, () => expect(true).toBe(true))
