import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'
import { rocketjump } from '../core'

const mockStoreWithSaga = (saga, ...mockStoreArgs) => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = [sagaMiddleware]
  const mockStore = configureStore(middlewares)
  const store = mockStore(...mockStoreArgs)
  sagaMiddleware.run(saga)
  return store
}

describe('Rocketjump saga', () => {
  const type = 'GET_SOCI'
  const state = 'soci'
  const mockApiResults = [
    {
      name: 'Gio Va',
      age: 24,
    },
    {
      name: 'Ma Ik',
      age: 29,
    },
  ]
  const mockApi = jest.fn().mockResolvedValueOnce(mockApiResults)

  it('should run an async api and dispatch LOADING and SUCCESS actions when response is ok', done => {
    const { actions: { load }, saga } = rocketjump({
      type,
      state,
      api: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockApi.mock.returnValues[0].then(() => {
      expect(store.getActions()).toEqual([
        {
          type,
          payload: { params: {} },
          meta: {},
        },
        {
          type: `${type}_LOADING`,
          meta: {},
        },
        {
          type: `${type}_SUCCESS`,
          meta: {},
          payload: {
            params: {},
            data: mockApiResults,
          }
        }
      ])
      done()
    })
  })
})
