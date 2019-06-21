import { createStore, applyMiddleware, combineReducers } from 'redux'
import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'
import { select, call } from 'redux-saga/effects'
import omit from 'lodash/omit'
import { rj } from '../rocketjump'
import { takeEveryAndCancel, takeLatestAndCancelGroupBy } from '../effects'

const spyWarn = jest.spyOn(global.console, 'warn')

beforeEach(() => {
  spyWarn.mockReset()
})

const mockStoreWithSaga = (saga, ...mockStoreArgs) => {
  const sagaMiddleware = createSagaMiddleware()
  const middlewares = [sagaMiddleware]
  const mockStore = configureStore(middlewares)
  const store = mockStore(...mockStoreArgs)
  sagaMiddleware.run(saga)
  return store
}

const createRealStoreWithSagaAndReducer = (saga, reducer, preloadedState) => {
  const sagaMiddleware = createSagaMiddleware()
  const store = createStore(
    reducer,
    preloadedState,
    applyMiddleware(sagaMiddleware)
  )
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

  it('should run an async api and dispatch LOADING and SUCCESS actions when resolved', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResults)
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockApi.mock.results[0].value.then(() => {
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
          },
        },
      ])
      done()
    })
  })

  it('should accept old api config but print warning', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResults)
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      api: mockApi,
    })()
    expect(spyWarn).toHaveBeenCalled()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockApi.mock.results[0].value.then(() => {
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
          },
        },
      ])
      done()
    })
  })

  it('should run an async api and dispatch LOADING and FAILURE actions when rejected', done => {
    const mockBadApi = jest.fn(
      () =>
        new Promise((_, reject) => {
          reject('Bad shit')
        })
    )
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockBadApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockBadApi.mock.results[0].value.catch(() => {
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
          type: `${type}_FAILURE`,
          meta: {},
          error: true,
          payload: 'Bad shit',
        },
      ])
      done()
    })
  })

  it('should pass params to api function', () => {
    const mockApi = jest.fn()
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load({ giova: 666, rinne: 22 }))
    expect(mockApi.mock.calls[0][0]).toEqual({ giova: 666, rinne: 22 })
  })

  it('can provide extra params to effect function', () => {
    const mockApi = jest.fn()
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      /* eslint-disable require-yield */
      effectExtraParams: function*() {
        return { giova: 99, maik: 23 }
      },
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load({ giova: 666, rinne: 22 }))
    expect(mockApi.mock.calls[0][0]).toEqual({ giova: 99, rinne: 22, maik: 23 })
  })

  it('still use apiExtraParams but print warning', () => {
    const mockApi = jest.fn()
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      /* eslint-disable require-yield */
      apiExtraParams: function*() {
        return { giova: 99, maik: 23 }
      },
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load({ giova: 666, rinne: 22 }))
    expect(mockApi.mock.calls[0][0]).toEqual({ giova: 99, rinne: 22, maik: 23 })
    expect(spyWarn).toHaveBeenCalled()
  })

  it('can map actions dispatched', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResults)
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      mapSuccessAction: a => ({
        ...a,
        meta: {
          ...a.meta,
          maik: a.meta.maik * 2,
        },
      }),
      mapLoadingAction: a => ({
        ...a,
        meta: omit(a.meta, 'maik'),
      }),
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load(undefined, { maik: 11.5 }))
    mockApi.mock.results[0].value.then(() => {
      expect(store.getActions()).toEqual([
        {
          type,
          payload: { params: {} },
          meta: { maik: 11.5 },
        },
        {
          type: `${type}_LOADING`,
          meta: {},
        },
        {
          type: `${type}_SUCCESS`,
          meta: { maik: 23 },
          payload: {
            params: {},
            data: mockApiResults,
          },
        },
      ])
      done()
    })
  })

  it('should call success effect on success', done => {
    const successEffect = jest.fn()
    const failureEffect = jest.fn()
    const mockApi = jest.fn().mockResolvedValueOnce('maik')
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      successEffect,
      failureEffect,
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockApi.mock.results[0].value.then(() => {
      expect(successEffect).toBeCalled()
      expect(failureEffect).not.toBeCalled()
      done()
    })
  })

  it('should call need effect to decide if run api', done => {
    const mockApi = jest.fn().mockResolvedValueOnce('maik')
    const needEffect = function*(meta) {
      const isDataEmpty = yield select(state => state.soci.data === null)
      return isDataEmpty
    }
    const {
      actions: { load },
      reducer,
      saga,
    } = rj({
      type,
      state,
      needEffect,
      effect: mockApi,
    })()
    const store = createRealStoreWithSagaAndReducer(
      saga,
      combineReducers({
        soci: reducer,
      })
    )
    store.dispatch(load())
    expect(mockApi).toBeCalled()
    mockApi.mock.results[0].value.then(() => {
      store.dispatch(load())
      // Should not be called again...
      expect(mockApi.mock.calls.length).toBe(1)
      done()
    })
  })

  it('should call failure effect on failure', done => {
    const successEffect = jest.fn()
    const failureEffect = jest.fn()
    const mockBadApi = jest.fn(
      () =>
        new Promise((_, reject) => {
          reject('Bad shit')
        })
    )
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      successEffect,
      failureEffect,
      effect: mockBadApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockBadApi.mock.results[0].value.catch(() => {
      expect(successEffect).not.toBeCalled()
      expect(failureEffect).toBeCalled()
      done()
    })
  })

  it('should be use the provided effect caller function', done => {
    const effectCaller = function*(apiFn) {
      const data = yield call(apiFn(1312))
      return data
    }
    const myApi = t => mockApi(t)
    const mockApi = jest.fn(
      token =>
        new Promise(resolve => {
          resolve('Maik~' + token)
        })
    )

    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effectCaller,
      effect: myApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockApi.mock.results[0].value.then(apiResult => {
      expect(apiResult).toBe('Maik~1312')
      done()
    })
  })

  it('should be still use callApi but print a warning', done => {
    const callApi = function*(apiFn) {
      const data = yield call(apiFn(1312))
      return data
    }
    const myApi = t => mockApi(t)
    const mockApi = jest.fn(
      token =>
        new Promise(resolve => {
          resolve('Maik~' + token)
        })
    )

    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      callApi,
      effect: myApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    mockApi.mock.results[0].value.then(apiResult => {
      expect(apiResult).toBe('Maik~1312')
      done()
    })
    expect(spyWarn).toHaveBeenCalled()
  })

  it('should dispatch meta along with actions', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResults)
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load(undefined, { maik: 23 }))
    mockApi.mock.results[0].value.then(() => {
      expect(store.getActions()).toEqual([
        {
          type,
          payload: { params: {} },
          meta: { maik: 23 },
        },
        {
          type: `${type}_LOADING`,
          meta: { maik: 23 },
        },
        {
          type: `${type}_SUCCESS`,
          meta: { maik: 23 },
          payload: {
            params: {},
            data: mockApiResults,
          },
        },
      ])
      done()
    })
  })

  it('should dispatch meta along with actions also when reject', done => {
    const mockBadApi = jest.fn(
      () =>
        new Promise((_, reject) => {
          reject('Bad shit')
        })
    )
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockBadApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load(undefined, { maik: 23 }))
    mockBadApi.mock.results[0].value.catch(() => {
      expect(store.getActions()).toEqual([
        {
          type,
          payload: { params: {} },
          meta: { maik: 23 },
        },
        {
          type: `${type}_LOADING`,
          meta: { maik: 23 },
        },
        {
          type: `${type}_FAILURE`,
          meta: { maik: 23 },
          error: true,
          payload: 'Bad shit',
        },
      ])
      done()
    })
  })

  it('can unload a side effect', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResults)
    const {
      actions: { load, unload },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    store.dispatch(unload())
    mockApi.mock.results[0].value.then(() => {
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
          type: `${type}_UNLOAD`,
          meta: {},
        },
      ])
      done()
    })
  })

  it('can unload a side effect using given unloadBy', done => {
    const mockApi = jest.fn().mockResolvedValueOnce(mockApiResults)
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
      unloadBy: 'LOGOUT',
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    store.dispatch({
      type: 'LOGOUT',
    })
    mockApi.mock.results[0].value.then(() => {
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
          type: `LOGOUT`,
        },
      ])
      done()
    })
  })

  it('take only the last side effect as default', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('bananasplit')
      .mockResolvedValueOnce('splitbanana')
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    store.dispatch(load())
    mockApi.mock.results[1].value.then(() => {
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
            data: 'splitbanana',
          },
        },
      ])
      done()
    })
  })

  it('take every side effect when specified', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('bananasplit')
      .mockResolvedValueOnce('splitbanana')
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
      takeEffect: takeEveryAndCancel,
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load())
    store.dispatch(load())
    mockApi.mock.results[1].value.then(r => {
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
          payload: {
            params: {},
            data: 'bananasplit',
          },
          meta: {},
        },
        {
          type: `${type}_SUCCESS`,
          meta: {},
          payload: {
            params: {},
            data: 'splitbanana',
          },
        },
      ])
      done()
    })
  })

  it('take latest side effect group by when specified', done => {
    const counterByName = {}
    const mockApi = jest.fn(
      ({ name }) =>
        new Promise(resolve => {
          counterByName[name] = (counterByName[name] || 0) + 1
          resolve(`${name} is cool ${counterByName[name]}`)
        })
    )
    const {
      actions: { load },
      saga,
    } = rj({
      type,
      state,
      effect: mockApi,
      takeEffect: takeLatestAndCancelGroupBy,
      takeEffectArgs: [({ meta }) => meta.name],
      proxyActions: {
        load: ({ load }) => name => load({ name }, { name }),
      },
    })()
    const store = mockStoreWithSaga(saga, {})
    store.dispatch(load('maik'))
    store.dispatch(load('giova'))
    store.dispatch(load('maik'))
    store.dispatch(load('lore'))

    mockApi.mock.results[3].value.then(r => {
      expect(store.getActions()).toEqual([
        {
          type,
          payload: { params: { name: 'maik' } },
          meta: { name: 'maik' },
        },
        {
          type: `${type}_LOADING`,
          meta: { name: 'maik' },
        },
        {
          type,
          payload: { params: { name: 'giova' } },
          meta: { name: 'giova' },
        },
        {
          type: `${type}_LOADING`,
          meta: { name: 'giova' },
        },
        {
          type,
          payload: { params: { name: 'maik' } },
          meta: { name: 'maik' },
        },
        {
          type: `${type}_LOADING`,
          meta: { name: 'maik' },
        },
        {
          type,
          payload: { params: { name: 'lore' } },
          meta: { name: 'lore' },
        },
        {
          type: `${type}_LOADING`,
          meta: { name: 'lore' },
        },
        {
          type: `${type}_SUCCESS`,
          payload: {
            params: { name: 'giova' },
            data: 'giova is cool 1',
          },
          meta: { name: 'giova' },
        },
        {
          type: `${type}_SUCCESS`,
          payload: {
            params: { name: 'maik' },
            data: 'maik is cool 2',
          },
          meta: { name: 'maik' },
        },
        {
          type: `${type}_SUCCESS`,
          payload: {
            params: { name: 'lore' },
            data: 'lore is cool 1',
          },
          meta: { name: 'lore' },
        },
      ])
      done()
    })
  })

  it('can be custom!', () => {
    expect.assertions(2)

    function api() {}
    function apiExtraParams() {}
    function takeEffect() {}
    function takeEffectArgs() {}
    function callApi() {}
    function successEffect() {}
    function failureEffect() {}

    function* customSaga() {}

    function makeCustomSaga(config) {
      expect(config).toEqual({
        type,
        state,
        api,
        apiExtraParams,
        takeEffect,
        takeEffectArgs,
        callApi,
        successEffect,
        failureEffect,
      })
      return customSaga
    }

    const { saga } = rj({
      type,
      state,
      saga: makeCustomSaga,
      api,
      apiExtraParams,
      takeEffect,
      takeEffectArgs,
      callApi,
      successEffect,
      failureEffect,
    })()
    expect(saga).toBe(customSaga)
  })
})
