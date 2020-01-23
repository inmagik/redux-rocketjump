import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import rjMiddleware from '../../rjMiddleware'
import { rj } from '../../rocketjump'
import useRjState from '../useRjState'

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

describe('useRjState', () => {
  it('should select the rj state defined by reducer from redux', () => {
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      effect: () => Promise.resolve(['ALB1312', 'G10V4', 'Sk3ffy']),
    })()

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useRjState(maRjState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current).toEqual({
      data: null,
      loading: false,
      error: null,
    })
  })

  it('should respect the exendibilty of rj and have the enhanced default state', () => {
    const maRjState = rj(
      rj({
        composeReducer: (prevState = { giova: 23 }) => prevState,
      }),
      rj({
        composeReducer: (prevState = { albi: 1312 }) => prevState,
      }),
      rj({
        composeReducer: (prevState = { skaffo: 777 }) => prevState,
      }),
      {
        type: 'GET_FRIENDS',
        state: 'friends',
        effect: () => Promise.resolve(['ALB1312', 'G10V4', 'Sk3ffy']),
      }
    )()

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useRjState(maRjState), {
      wrapper: ReduxWrapper,
    })

    expect(result.current).toEqual({
      data: null,
      giova: 23,
      skaffo: 777,
      albi: 1312,
      loading: false,
      error: null,
    })
  })

  it('should select the rj state defined by reducer from redux and be in sync with dispactch actions', async () => {
    const mockEffect = jest
      .fn()
      .mockResolvedValueOnce(['ALB1312', 'G10V4', 'Sk3ffy'])
      .mockRejectedValueOnce('FUCK_LA')

    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      effect: mockEffect,
    })()

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useRjState(maRjState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current).toEqual({
      data: null,
      loading: false,
      error: null,
    })

    // Wait side effects runned + react commit shit
    await act(async () => {
      store.dispatch(maRjState.actions.load())
      return mockEffect.mock.results[0].value
    })

    expect(result.current).toEqual({
      data: ['ALB1312', 'G10V4', 'Sk3ffy'],
      loading: false,
      error: null,
    })

    // Wait side effects runned + react commit shit
    try {
      await act(async () => {
        store.dispatch(maRjState.actions.load())
        return mockEffect.mock.results[1].value
      })
    } catch {}

    expect(result.current).toEqual({
      data: ['ALB1312', 'G10V4', 'Sk3ffy'],
      loading: false,
      error: 'FUCK_LA',
    })
  })

  it('should dervive the state if a function is provided', () => {
    const mockEffect = jest.fn(() =>
      Promise.resolve(['ALB1312', 'G10V4', 'Sk3ffy'])
    )
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      composeReducer: (prevState = { giova: 23 }) => prevState,
      effect: mockEffect,
    })()

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () =>
        useRjState(maRjState, (state, { getBaseState }) => ({
          ...getBaseState(state),
          maik: 1312,
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current).toEqual({
      data: null,
      giova: 23,
      maik: 1312,
      loading: false,
      error: null,
    })
  })

  it('should dervive the state if a function is provided and give rj selectors', () => {
    const mockEffect = jest.fn(() =>
      Promise.resolve(['ALB1312', 'G10V4', 'Sk3ffy'])
    )
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      composeReducer: (prevState = { giova: 23 }) => prevState,
      effect: mockEffect,
    })()

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () =>
        useRjState(maRjState, (state, { getData }) => ({
          friends: getData(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current).toEqual({
      friends: null,
    })
  })

  it('should compute state using given computed config', () => {
    const maRjState = rj(
      rj({
        computed: {
          shitBro: 'getError',
          giova: 'getData',
          magik: 'getMagic',
          budda: 'getBuddy',
        },
        selectors: () => ({
          getBuddy: () => 23,
          getMagic: () => 23,
        }),
      }),
      rj({
        computed: {
          shitBro: 'getError',
          giova: 'getData',
        },
      }),
      {
        type: 'GET_BABU',
        state: 'babuland',
        effect: () => Promise.resolve(1312),
        computed: {
          babu: 'isLoading',
          friends: 'getData',
        },
        selectors: ({ getBuddy }) => ({
          getBuddy: () => getBuddy() * 2,
        }),
      }
    )()

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        babuland: maRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useRjState(maRjState), {
      wrapper: ReduxWrapper,
    })

    expect(result.current).toEqual({
      budda: 46,
      magik: 23,
      shitBro: null,
      babu: false,
      friends: null,
    })
  })

  it('should compute state and give them to select state as last args', () => {
    const maRjState = rj(
      rj({
        computed: {
          shitBro: 'getError',
          giova: 'getData',
          magik: 'getMagic',
          budda: 'getBuddy',
        },
        selectors: () => ({
          getBuddy: () => 23,
          getMagic: () => 23,
        }),
      }),
      rj({
        computed: {
          shitBro: 'getError',
          giova: 'getData',
        },
      }),
      {
        effect: () => Promise.resolve(1312),
        type: 'KILL_BABU',
        state: 'babuland',
        computed: {
          babu: 'isLoading',
          friends: 'getData',
        },
        selectors: ({ getBuddy }) => ({
          getBuddy: () => getBuddy() * 2,
        }),
      }
    )()

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        babuland: maRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () =>
        useRjState(maRjState, (state, selectors, computedState) => ({
          buddaTek: computedState.magik,
          waiting: selectors.isLoading(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current).toEqual({
      buddaTek: 23,
      waiting: false,
    })
  })

  it('should get angry with a non rj object is passed as argument', () => {
    expect(() => {
      useRjState(rj())
    }).toThrowError(
      /\[redux-rocketjump\] You should provide a rj object to useRjState/
    )
    expect(() => {
      useRjState(23)
    }).toThrowError(
      /\[redux-rocketjump\] You should provide a rj object to useRjState/
    )
  })

  it('should mantein the same return instance while state remain the same', () => {
    const MaRjState = rj({
      type: 'X',
      state: 'X',
      effect: () => {},
    })()

    const store = createRealStoreWithSagaAndReducer(
      MaRjState.saga,
      combineReducers({
        babuland: MaRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result, rerender } = renderHook(() => useRjState(MaRjState), {
      wrapper: ReduxWrapper,
    })

    let out = result.current

    rerender({ giova: 23 })

    expect(out).toBe(result.current)
  })
})
