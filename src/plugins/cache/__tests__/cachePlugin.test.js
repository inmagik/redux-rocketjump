import { combineReducers } from 'redux'
import { rj } from '../../../rocketjump'
import { createRealStoreWithSagaAndReducer } from '../../../testUtils'
import rjCache from '../index'

describe('Cache plugin', () => {
  it('run api only when is empty', done => {
    const mockApi = jest.fn().mockResolvedValue('GioVa')
    const {
      actions: { load },
      reducer,
      saga,
    } = rj(rjCache(), {
      type: 'GET_SOCI',
      state: 'soci',
      effect: mockApi,
    })()

    const store = createRealStoreWithSagaAndReducer(
      saga,
      combineReducers({
        soci: reducer,
      })
    )[0]
    store.dispatch(load())
    expect(mockApi).toBeCalled()
    mockApi.mock.results[0].value.then(() => {
      store.dispatch(load())
      // Should not be called again...
      expect(mockApi.mock.calls.length).toBe(1)
      done()
    })
  })

  it('run api only when is empty excpet when use force action', done => {
    const mockApi = jest.fn().mockResolvedValue('GioVa')
    const {
      actions: { load, loadForce },
      reducer,
      saga,
    } = rj(rjCache(), {
      type: 'GET_SOCI',
      state: 'soci',
      effect: mockApi,
    })()

    const store = createRealStoreWithSagaAndReducer(
      saga,
      combineReducers({
        soci: reducer,
      })
    )[0]
    store.dispatch(load())
    expect(mockApi).toBeCalled()
    mockApi.mock.results[0].value.then(() => {
      store.dispatch(loadForce())
      expect(mockApi.mock.calls.length).toBe(2)
      done()
    })
  })
  it('can be purged by certain actions', done => {
    const mockApi = jest.fn().mockResolvedValue('GioVa')
    const {
      actions: { load },
      reducer,
      saga,
    } = rj(
      rjCache({
        purge: 'LOGOUT',
      }),
      {
        type: 'GET_SOCI',
        state: 'soci',
        effect: mockApi,
      }
    )()

    const store = createRealStoreWithSagaAndReducer(
      saga,
      combineReducers({
        soci: reducer,
      })
    )[0]
    expect(store.getState()).toEqual({
      soci: {
        loading: false,
        error: null,
        data: null,
      },
    })
    store.dispatch(load())
    mockApi.mock.results[0].value.then(() => {
      expect(store.getState()).toEqual({
        soci: {
          loading: false,
          error: null,
          data: 'GioVa',
        },
      })
      store.dispatch({
        type: 'LOGOUT',
      })
      expect(store.getState()).toEqual({
        soci: {
          loading: false,
          error: null,
          data: null,
        },
      })
      done()
    })
  })
})
