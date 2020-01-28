import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import rjMiddleware from '../../rjMiddleware'
import { rj } from '../../rocketjump'
import useRj from '../useRj'

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

describe('useRj', () => {
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

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current[0]).toEqual({
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

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })

    expect(result.current[0]).toEqual({
      data: null,
      giova: 23,
      skaffo: 777,
      albi: 1312,
      loading: false,
      error: null,
    })
  })

  it('should select the rj state defined by reducer from redux and be in sync with dispactch actions', async () => {
    const mockEffect = jest.fn(() =>
      Promise.resolve(['ALB1312', 'G10V4', 'Sk3ffy'])
    )
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

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })
    expect(result.current[0]).toEqual({
      data: null,
      loading: false,
      error: null,
    })

    // Wait side effects runned + react commit shit
    await act(async () => {
      store.dispatch(maRjState.actions.load())
      return mockEffect.mock.results[0].value
    })

    expect(result.current[0]).toEqual({
      data: ['ALB1312', 'G10V4', 'Sk3ffy'],
      loading: false,
      error: null,
    })
  })

  it('should dispatch also non-effect action', async () => {
    const mockEffect = jest.fn(() => Promise.resolve(true))
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      effect: mockEffect,
    })()

    const [store, actionsLog] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })
    expect(store.getState().friends).toEqual({
      data: null,
      loading: false,
      error: null,
    })
    expect(result.current[0]).toEqual({
      data: null,
      loading: false,
      error: null,
    })

    await act(async () => {
      result.current[1].updateData('Big Ben Boss')
    })
    expect(result.current[0]).toEqual({
      data: 'Big Ben Boss',
      loading: false,
      error: null,
    })
    expect(actionsLog[0]).toEqual({
      type: 'GET_FRIENDS_UPDATE_DATA',
      payload: 'Big Ben Boss',
    })
    expect(store.getState().friends).toEqual({
      data: 'Big Ben Boss',
      loading: false,
      error: null,
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
        useRj(maRjState, (state, { getBaseState }) => ({
          ...getBaseState(state),
          maik: 1312,
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current[0]).toEqual({
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
        useRj(maRjState, (state, { getData }) => ({
          friends: getData(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current[0]).toEqual({
      friends: null,
    })
  })

  it('should use buildable actions withMeta', async () => {
    const mockEffect = jest.fn(() =>
      Promise.resolve(['ALB1312', 'G10V4', 'Sk3ffy'])
    )
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      composeReducer: (prevState = { giova: 23 }) => prevState,
      effect: mockEffect,
    })()

    const [store, actionsLog] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          friends: getData(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    await act(async () => {
      result.current[1].run.withMeta({ giova: 23 }).run('Un', 'Dos', 'Tres')
    })
    expect(actionsLog[0]).toEqual({
      type: 'GET_FRIENDS',
      payload: {
        params: ['Un', 'Dos', 'Tres'],
      },
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[1]).toEqual({
      type: 'GET_FRIENDS_LOADING',
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[2]).toEqual({
      type: 'GET_FRIENDS_SUCCESS',
      payload: {
        params: ['Un', 'Dos', 'Tres'],
        data: ['ALB1312', 'G10V4', 'Sk3ffy'],
      },
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(mockEffect).nthCalledWith(1, 'Un', 'Dos', 'Tres')
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

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })

    expect(result.current[0]).toEqual({
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
        useRj(maRjState, (state, selectors, computedState) => ({
          buddaTek: computedState.magik,
          waiting: selectors.isLoading(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current[0]).toEqual({
      buddaTek: 23,
      waiting: false,
    })
  })

  it('should run rj sideEffects and react to succees', async () => {
    const mockFn = jest.fn().mockResolvedValue(23)
    const maRjState = rj({
      type: 'KILL_BABU',
      state: 'babuland',
      effect: mockFn,
    })()

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        babuland: maRjState.reducer,
      })
    )[0]

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          friends: getData(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current[0]).toEqual({
      friends: null,
    })

    await act(async () => {
      result.current[1].run()
    })
    expect(result.current[0]).toEqual({
      friends: 23,
    })
  })

  it('should run rj sideEffects and react to failure', async () => {
    const mockFn = jest.fn(() => Promise.reject('Bleah'))
    const maRjState = rj({
      type: 'KILL_BABU',
      state: 'babuland',
      effect: mockFn,
    })()

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const store = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        babuland: maRjState.reducer,
      })
    )[0]

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getError }) => ({
          error: getError(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    expect(result.current[0]).toEqual({
      error: null,
    })

    await act(async () => {
      result.current[1].run()
    })
    expect(result.current[0]).toEqual({
      error: 'Bleah',
    })
  })

  it('should get angry with a non rj object is passed as argument', () => {
    expect(() => {
      useRj(rj())
    }).toThrowError(
      /\[redux-rocketjump\] You should provide a rj object to useRj/
    )
    expect(() => {
      useRj(23)
    }).toThrowError(
      /\[redux-rocketjump\] You should provide a rj object to useRj/
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

    const { result, rerender } = renderHook(() => useRj(MaRjState), {
      wrapper: ReduxWrapper,
    })

    let out = result.current

    rerender({ giova: 23 })

    expect(out).toBe(result.current)
  })

  it('should call onSuccess', async () => {
    const mockEffect = jest.fn(() =>
      Promise.resolve(['ALB1312', 'G10V4', 'Sk3ffy'])
    )
    const mockOnSuccess = jest.fn()
    const mockOnFailure = jest.fn()
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      composeReducer: (prevState = { giova: 23 }) => prevState,
      effect: mockEffect,
    })()

    const [store, actionsLog] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          friends: getData(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    await act(async () => {
      result.current[1].run
        .onSuccess(mockOnSuccess)
        .onFailure(mockOnFailure)
        .withMeta({ giova: 23 })
        .run('Un', 'Dos', 'Tres')
    })
    expect(actionsLog[0]).toEqual({
      type: 'GET_FRIENDS',
      payload: {
        params: ['Un', 'Dos', 'Tres'],
      },
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[1]).toEqual({
      type: 'GET_FRIENDS_LOADING',
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[2]).toEqual({
      type: 'GET_FRIENDS_SUCCESS',
      payload: {
        params: ['Un', 'Dos', 'Tres'],
        data: ['ALB1312', 'G10V4', 'Sk3ffy'],
      },
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(mockEffect).nthCalledWith(1, 'Un', 'Dos', 'Tres')
    expect(mockOnSuccess).nthCalledWith(1, ['ALB1312', 'G10V4', 'Sk3ffy'])
    expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    expect(mockOnFailure).toHaveBeenCalledTimes(0)
  })

  it('should call onFailure', async () => {
    const mockEffect = jest.fn(() => Promise.reject('SYSTEM_ERROR'))
    const mockOnSuccess = jest.fn()
    const mockOnFailure = jest.fn()
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      composeReducer: (prevState = { giova: 23 }) => prevState,
      effect: mockEffect,
    })()

    const [store, actionsLog] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          friends: getData(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    await act(async () => {
      result.current[1].run
        .onSuccess(mockOnSuccess)
        .onFailure(mockOnFailure)
        .withMeta({ giova: 23 })
        .run('Un', 'Dos', 'Tres')
    })
    expect(actionsLog[0]).toEqual({
      type: 'GET_FRIENDS',
      payload: {
        params: ['Un', 'Dos', 'Tres'],
      },
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[1]).toEqual({
      type: 'GET_FRIENDS_LOADING',
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[2]).toEqual({
      error: true,
      type: 'GET_FRIENDS_FAILURE',
      payload: 'SYSTEM_ERROR',
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(mockEffect).nthCalledWith(1, 'Un', 'Dos', 'Tres')
    expect(mockOnFailure).nthCalledWith(1, 'SYSTEM_ERROR')
    expect(mockOnSuccess).toHaveBeenCalledTimes(0)
    expect(mockOnFailure).toHaveBeenCalledTimes(1)
  })

  it("should don't call onSuccess on unmoutend rj", async () => {
    let resolve
    const mockEffect = jest.fn(
      () =>
        new Promise(_resolve => {
          resolve = _resolve
        })
    )
    const mockOnSuccess = jest.fn()
    const mockOnFailure = jest.fn()
    const maRjState = rj({
      type: 'GET_FRIENDS',
      state: 'friends',
      composeReducer: (prevState = { giova: 23 }) => prevState,
      effect: mockEffect,
    })()

    const [store, actionsLog] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        friends: maRjState.reducer,
      })
    )

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { result, unmount } = renderHook(
      () =>
        useRj(maRjState, (state, { getData }) => ({
          friends: getData(state),
        })),
      {
        wrapper: ReduxWrapper,
      }
    )

    await act(async () => {
      result.current[1].run
        .onSuccess(mockOnSuccess)
        .onFailure(mockOnFailure)
        .withMeta({ giova: 23 })
        .run('Un', 'Dos', 'Tres')
    })
    await unmount()
    await resolve(['ALB1312', 'G10V4', 'Sk3ffy'])
    expect(actionsLog[0]).toEqual({
      type: 'GET_FRIENDS',
      payload: {
        params: ['Un', 'Dos', 'Tres'],
      },
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[1]).toEqual({
      type: 'GET_FRIENDS_LOADING',
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(actionsLog[2]).toEqual({
      type: 'GET_FRIENDS_SUCCESS',
      payload: {
        params: ['Un', 'Dos', 'Tres'],
        data: ['ALB1312', 'G10V4', 'Sk3ffy'],
      },
      meta: {
        rjCallId: expect.any(Number),
        giova: 23,
      },
    })
    expect(mockEffect).nthCalledWith(1, 'Un', 'Dos', 'Tres')
    expect(mockOnSuccess).toHaveBeenCalledTimes(0)
    expect(mockOnFailure).toHaveBeenCalledTimes(0)
  })
})
