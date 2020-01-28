import React from 'react'
import { rj } from '../../rocketjump'
import rjMiddleware from '../../rjMiddleware'
import useRj from '../../hooks/useRj'
import { renderHook } from '@testing-library/react-hooks'
import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'

const createRealStoreWithSagaAndReducer = (saga, reducer, preloadedState) => {
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

describe('RJ mutations state', () => {
  it('should return the root state default', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => Promise.resolve(1312),
    })()

    const store = createRealStoreWithSagaAndReducer(
      MaRjState.saga,
      combineReducers({
        babu: MaRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useRj(MaRjState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current[0]).toEqual({
      loading: false,
      data: null,
      error: null,
    })
  })

  it('should give a selector to grab the parent state from select state', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => Promise.resolve(1312),
    })()

    const store = createRealStoreWithSagaAndReducer(
      MaRjState.saga,
      combineReducers({
        babu: MaRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () =>
        useRj(MaRjState, (state, { getParentBaseState }) =>
          getParentBaseState(state)
        ),
      {
        wrapper: ReduxWrapper,
      }
    )
    expect(result.current[0]).toEqual({
      root: {
        loading: false,
        data: null,
        error: null,
      },
      mutations: {
        killHumans: { giova: 23 },
      },
    })
  })

  it('should give a selector to grab the base state from select state', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => Promise.resolve(1312),
    })()

    const store = createRealStoreWithSagaAndReducer(
      MaRjState.saga,
      combineReducers({
        babu: MaRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const selectState = (state, { getBaseState }) => getBaseState(state)
    const { result } = renderHook(() => useRj(MaRjState, selectState), {
      wrapper: ReduxWrapper,
    })

    expect(result.current[0]).toEqual({
      loading: false,
      data: null,
      error: null,
    })
  })

  it('should give a selector to grab all mutations state', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => Promise.resolve(1312),
    })()

    const store = createRealStoreWithSagaAndReducer(
      MaRjState.saga,
      combineReducers({
        babu: MaRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const selectState = (state, { getMutationsState }) =>
      getMutationsState(state)
    const { result } = renderHook(() => useRj(MaRjState, selectState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current[0]).toEqual({
      killHumans: {
        giova: 23,
      },
    })
  })

  it('should give a selector to grab mutation state', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => Promise.resolve(1312),
    })()

    const store = createRealStoreWithSagaAndReducer(
      MaRjState.saga,
      combineReducers({
        babu: MaRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const selectState = (state, { getMutation }) => ({
      xd: getMutation(state, 'killHumans'),
    })
    const { result } = renderHook(() => useRj(MaRjState, selectState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current[0]).toEqual({
      xd: { giova: 23 },
    })
  })

  it('should give a selector to grab mutation state deep', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
          reducer: (state = { giova: 23 }, action) => state,
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => Promise.resolve(1312),
    })()

    const store = createRealStoreWithSagaAndReducer(
      MaRjState.saga,
      combineReducers({
        babu: MaRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const selectState = (state, { getMutation }) => ({
      xd: getMutation(state, 'killHumans.giova'),
    })
    const { result } = renderHook(() => useRj(MaRjState, selectState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current[0]).toEqual({
      xd: 23,
    })
  })
})
