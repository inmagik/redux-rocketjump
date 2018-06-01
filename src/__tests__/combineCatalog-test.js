import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'
import { rj } from '../rocketjump'
import combineRjs from '../catalogs/combine'

const mockStoreWithSaga = (saga, ...mockStoreArgs) => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = [sagaMiddleware]
  const mockStore = configureStore(middlewares)
  const store = mockStore(...mockStoreArgs)
  sagaMiddleware.run(saga)
  return store
}

describe('Combine catalog', () => {
  it('Should be able to combine reducers by key', () => {
    const c = combineRjs({}, {
      list: rj({
        type: 'GET_TODOS_LIST',
      }),
      guacamole: rj({
        type: 'GUACAMOLE!',
        proxyReducer: () => () => 'guacamole',
      })
    })
    // expect(c.reducer(undefined, { type: '@HELLO' })).toEqual({
    //   list: {
    //     loading: false,
    //     error: null,
    //     data: null,
    //   },
    //   guacamole: 'guacamole',
    // })
  })
})
