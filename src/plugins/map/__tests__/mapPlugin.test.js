import configureStore from 'redux-mock-store'
import createSagaMiddleware from 'redux-saga'
import { rj } from '../../../rocketjump'
import rjMap from '../index'
import { createMockStoreWithSaga } from '../../../testUtils'

describe('Map plugin', () => {
  it('should make map reducer', () => {
    const { reducer } = rj(rjMap(), {
      type: 'GET_USER',
      state: 'users',
    })()

    let state = reducer(
      {},
      {
        type: 'GET_USER_LOADING',
        meta: { id: 23 },
      }
    )
    expect(state).toEqual({
      '23': {
        loading: true,
        error: null,
        data: null,
      },
    })
    state = reducer(state, {
      type: 'GET_USER_LOADING',
      meta: { id: 99 },
    })
    expect(state).toEqual({
      '23': {
        loading: true,
        error: null,
        data: null,
      },
      '99': {
        loading: true,
        error: null,
        data: null,
      },
    })
    state = reducer(state, {
      type: 'GET_USER_SUCCESS',
      payload: { data: { name: 'Gio Va', id: 23 } },
      meta: { id: 23 },
    })
    expect(state).toEqual({
      '23': {
        loading: false,
        error: null,
        data: {
          id: 23,
          name: 'Gio Va',
        },
      },
      '99': {
        loading: true,
        error: null,
        data: null,
      },
    })
    state = reducer(state, {
      type: 'GET_USER_FAILURE',
      payload: 'Doh',
      meta: { id: 99 },
    })
    expect(state).toEqual({
      '23': {
        loading: false,
        error: null,
        data: {
          id: 23,
          name: 'Gio Va',
        },
      },
      '99': {
        loading: false,
        error: 'Doh',
        data: null,
      },
    })
    state = reducer(state, {
      type: 'GET_USER_UNLOAD',
      meta: { id: 99 },
    })
    expect(state).toEqual({
      '23': {
        loading: false,
        error: null,
        data: {
          id: 23,
          name: 'Gio Va',
        },
      },
    })
    state = reducer(state, {
      type: 'GET_USER_UNLOAD',
      meta: {},
    })
    expect(state).toEqual({})
  })

  it('should make map selectors', () => {
    const {
      reducer,
      selectors: { getMapData, getMapLoadings, getMapFailures },
    } = rj(rjMap(), {
      type: 'GET_USER',
      state: 'users',
    })()

    let state = reducer(
      {},
      {
        type: 'GET_USER_LOADING',
        meta: { id: 23 },
      }
    )
    expect(getMapLoadings({ users: state })).toEqual({
      '23': true,
    })
    expect(getMapFailures({ users: state })).toEqual({})
    expect(getMapData({ users: state })).toEqual({})

    state = reducer(state, {
      type: 'GET_USER_LOADING',
      meta: { id: 99 },
    })
    expect(getMapLoadings({ users: state })).toEqual({
      '23': true,
      '99': true,
    })
    expect(getMapFailures({ users: state })).toEqual({})
    expect(getMapData({ users: state })).toEqual({})

    state = reducer(state, {
      type: 'GET_USER_SUCCESS',
      payload: { data: { name: 'Gio Va', id: 23 } },
      meta: { id: 23 },
    })
    expect(getMapLoadings({ users: state })).toEqual({
      '99': true,
    })
    expect(getMapFailures({ users: state })).toEqual({})
    expect(getMapData({ users: state })).toEqual({
      '23': { name: 'Gio Va', id: 23 },
    })

    state = reducer(state, {
      type: 'GET_USER_FAILURE',
      payload: 'Doh',
      meta: { id: 99 },
    })
    expect(getMapLoadings({ users: state })).toEqual({})
    expect(getMapFailures({ users: state })).toEqual({
      '99': 'Doh',
    })
    expect(getMapData({ users: state })).toEqual({
      '23': { name: 'Gio Va', id: 23 },
    })

    state = reducer(state, {
      type: 'GET_USER_UNLOAD',
      meta: { id: 99 },
    })
    expect(getMapLoadings({ users: state })).toEqual({})
    expect(getMapFailures({ users: state })).toEqual({})
    expect(getMapData({ users: state })).toEqual({
      '23': { name: 'Gio Va', id: 23 },
    })

    state = reducer(state, {
      type: 'GET_USER_UNLOAD',
      meta: {},
    })
    expect(getMapLoadings({ users: state })).toEqual({})
    expect(getMapFailures({ users: state })).toEqual({})
    expect(getMapData({ users: state })).toEqual({})
  })

  it('should make map action creators', () => {
    const {
      actions: { loadKey, unloadKey },
    } = rj(rjMap(), {
      type: 'GET_USER',
      state: 'users',
    })()

    expect(loadKey(23)).toEqual({
      type: 'GET_USER',
      payload: { params: { id: 23 } },
      meta: { id: 23 },
    })

    expect(unloadKey(23)).toEqual({
      type: 'GET_USER_UNLOAD',
      meta: { id: 23 },
    })
  })

  it('should make map group by saga default using meta id', done => {
    const mockApi = jest
      .fn()
      .mockResolvedValueOnce('GioVa')
      .mockResolvedValueOnce('KING')
      .mockResolvedValueOnce('4EVER')
    const {
      actions: { loadKey },
      saga,
    } = rj(rjMap(), {
      type: 'GET_USER',
      state: 'users',
      effect: mockApi,
    })()

    const store = createMockStoreWithSaga(saga)
    store.dispatch(loadKey(23))
    store.dispatch(loadKey(32))
    store.dispatch(loadKey(23))

    mockApi.mock.results[2].value.then(() => {
      expect(store.getActions()).toEqual([
        // First call
        {
          type: 'GET_USER',
          payload: { params: { id: 23 } },
          meta: { id: 23 },
        },
        {
          type: 'GET_USER_LOADING',
          meta: { id: 23 },
        },
        // Second call
        {
          type: 'GET_USER',
          payload: { params: { id: 32 } },
          meta: { id: 32 },
        },
        {
          type: 'GET_USER_LOADING',
          meta: { id: 32 },
        },
        // Third call
        {
          type: 'GET_USER',
          payload: { params: { id: 23 } },
          meta: { id: 23 },
        },
        {
          type: 'GET_USER_LOADING',
          meta: { id: 23 },
        },
        // Second call success
        {
          type: 'GET_USER_SUCCESS',
          meta: { id: 32 },
          payload: { data: 'KING', params: { id: 32 } },
        },
        // Third call success (The first call was cancelled)
        {
          type: 'GET_USER_SUCCESS',
          meta: { id: 23 },
          payload: { data: '4EVER', params: { id: 23 } },
        },
      ])
      done()
    })
  })
})
