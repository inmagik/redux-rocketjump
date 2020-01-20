import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { rj } from '../rocketjump'
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
    applyMiddleware(sagaMiddleware, actionLogMiddleware)
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

  // it('should compute state using given computed config', () => {
  //   const maRjState = rj(
  //     rj({
  //       computed: {
  //         shitBro: 'getError',
  //         giova: 'getData',
  //         magik: 'getMagic',
  //         budda: 'getBuddy',
  //       },
  //       selectors: () => ({
  //         getBuddy: () => 23,
  //         getMagic: () => 23,
  //       }),
  //     }),
  //     rj({
  //       computed: {
  //         shitBro: 'getError',
  //         giova: 'getData',
  //       },
  //     }),
  //     {
  //       effect: () => Promise.resolve(1312),
  //       computed: {
  //         babu: 'isLoading',
  //         friends: 'getData',
  //       },
  //       selectors: ({ getBuddy }) => ({
  //         getBuddy: () => getBuddy() * 2,
  //       }),
  //     }
  //   )
  //
  //   const { result } = renderHook(() => useRj(maRjState))
  //
  //   expect(result.current[0]).toEqual({
  //     budda: 46,
  //     magik: 23,
  //     shitBro: null,
  //     babu: false,
  //     friends: null,
  //   })
  // })
  //
  // it('should compute state and give them to select state as last args', () => {
  //   const maRjState = rj(
  //     rj({
  //       computed: {
  //         shitBro: 'getError',
  //         giova: 'getData',
  //         magik: 'getMagic',
  //         budda: 'getBuddy',
  //       },
  //       selectors: () => ({
  //         getBuddy: () => 23,
  //         getMagic: () => 23,
  //       }),
  //     }),
  //     rj({
  //       computed: {
  //         shitBro: 'getError',
  //         giova: 'getData',
  //       },
  //     }),
  //     {
  //       effect: () => Promise.resolve(1312),
  //       computed: {
  //         babu: 'isLoading',
  //         friends: 'getData',
  //       },
  //       selectors: ({ getBuddy }) => ({
  //         getBuddy: () => getBuddy() * 2,
  //       }),
  //     }
  //   )
  //
  //   const { result } = renderHook(() =>
  //     useRj(maRjState, (state, selectors, computedState) => ({
  //       buddaTek: computedState.magik,
  //       waiting: selectors.isLoading(state),
  //     }))
  //   )
  //
  //   expect(result.current[0]).toEqual({
  //     buddaTek: 23,
  //     waiting: false,
  //   })
  // })
  //
  // it('should create a per-instance version of selectors to enable good memoization', () => {
  //   const mySelector = jest
  //     .fn()
  //     .mockImplementation(n => (n === 0 ? 0 : n + 1300))
  //
  //   const maRjState = rj(
  //     rj({
  //       composeReducer: (prevState = { data: 0, beat: 0 }, action) => {
  //         if (action.type === 'GANG') {
  //           return {
  //             ...prevState,
  //             data: action.payload + prevState.data,
  //           }
  //         }
  //         if (action.type === 'CHARLIE') {
  //           return {
  //             ...prevState,
  //             beat: prevState.beat + 1,
  //           }
  //         }
  //         return prevState
  //       },
  //       actions: () => ({
  //         gang: n => ({ type: 'GANG', payload: n }),
  //         charlie: () => ({ type: 'CHARLIE' }),
  //       }),
  //       selectors: ({ getData }) => {
  //         const memoSelector = memoize(mySelector)
  //         return { getMaik: state => memoSelector(getData(state)) }
  //       },
  //     }),
  //     () => Promise.resolve(1312)
  //   )
  //
  //   const { result: resultA } = renderHook(() =>
  //     useRj(maRjState, (state, { getMaik }) => ({
  //       friends: getMaik(state),
  //       beat: state.beat,
  //     }))
  //   )
  //   const { result: resultB } = renderHook(() =>
  //     useRj(maRjState, (state, { getMaik }) => ({
  //       friends: getMaik(state),
  //       beat: state.beat,
  //     }))
  //   )
  //
  //   // No MEMO selectors called 2 Time
  //   expect(mySelector).toHaveBeenCalledTimes(2)
  //   expect(resultA.current[0]).toEqual({
  //     friends: 0,
  //     beat: 0,
  //   })
  //   expect(resultB.current[0]).toEqual({
  //     friends: 0,
  //     beat: 0,
  //   })
  //
  //   // Break memo of A
  //   act(() => resultA.current[1].gang(12))
  //
  //   expect(mySelector).toHaveBeenCalledTimes(3)
  //   expect(resultA.current[0]).toEqual({
  //     friends: 1312,
  //     beat: 0,
  //   })
  //   expect(resultB.current[0]).toEqual({
  //     friends: 0,
  //     beat: 0,
  //   })
  //
  //   // State change but...
  //   act(() => resultA.current[1].charlie())
  //
  //   // Ma FUCKING A MEMO GANG!!!!
  //   expect(mySelector).toHaveBeenCalledTimes(3)
  //   expect(resultA.current[0]).toEqual({
  //     friends: 1312,
  //     beat: 1,
  //   })
  //
  //   // Break memo B
  //   act(() => resultB.current[1].gang(12))
  //
  //   // ... Ensure break memo
  //   expect(mySelector).toHaveBeenCalledTimes(4)
  //   expect(resultA.current[0]).toEqual({
  //     friends: 1312,
  //     beat: 1,
  //   })
  //   expect(resultB.current[0]).toEqual({
  //     friends: 1312,
  //     beat: 0,
  //   })
  //
  //   // Trigger the change on A state ...
  //   act(() => resultA.current[1].charlie())
  //
  //   // A still memo :D
  //   expect(mySelector).toHaveBeenCalledTimes(4)
  //   expect(resultA.current[0]).toEqual({
  //     friends: 1312,
  //     beat: 2,
  //   })
  // })
  //
  // it('should run rj sideEffects and react to succees', async () => {
  //   const mockFn = jest.fn().mockResolvedValue(23)
  //   const maRjState = rj(mockFn)
  //
  //   const { result } = renderHook(() =>
  //     useRj(maRjState, (state, { getData }) => ({
  //       friends: getData(state),
  //     }))
  //   )
  //
  //   expect(result.current[0]).toEqual({
  //     friends: null,
  //   })
  //
  //   await act(async () => {
  //     result.current[1].run()
  //   })
  //   expect(result.current[0]).toEqual({
  //     friends: 23,
  //   })
  // })
  //
  // it('should run rj sideEffects and react to failure', async () => {
  //   const mockFn = jest.fn(() => Promise.reject('Bleah'))
  //   const maRjState = rj(mockFn)
  //
  //   const { result } = renderHook(() =>
  //     useRj(maRjState, (state, { getError }) => ({
  //       error: getError(state),
  //     }))
  //   )
  //
  //   expect(result.current[0]).toEqual({
  //     error: null,
  //   })
  //
  //   await act(async () => {
  //     result.current[1].run()
  //   })
  //   expect(result.current[0]).toEqual({
  //     error: 'Bleah',
  //   })
  // })
  //
  // it('should get angry with a non rj object is passed as argument', () => {
  //   expect(() => {
  //     useRj(rj())
  //   }).toThrowError(
  //     /\[react-rocketjump\] You should provide a rj object to useRj/
  //   )
  //   expect(() => {
  //     useRj({})
  //   }).toThrowError(
  //     /\[react-rocketjump\] You should provide a rj object to useRj/
  //   )
  //   expect(() => {
  //     useRj(23)
  //   }).toThrowError(
  //     /\[react-rocketjump\] You should provide a rj object to useRj/
  //   )
  //   expect(() => {
  //     useRj()
  //   }).toThrowError(
  //     /\[react-rocketjump\] You should provide a rj object to useRj/
  //   )
  // })
  //
  // it('should provide a good state observable', async () => {
  //   let resolves = []
  //   const mockFn = jest
  //     .fn()
  //     .mockImplementationOnce(
  //       () =>
  //         new Promise(resolve => {
  //           resolves[0] = resolve
  //         })
  //     )
  //     .mockImplementationOnce(
  //       () =>
  //         new Promise(resolve => {
  //           resolves[1] = resolve
  //         })
  //     )
  //     .mockImplementationOnce(
  //       () =>
  //         new Promise(resolve => {
  //           resolves[2] = resolve
  //         })
  //     )
  //
  //   const testMaState = jest.fn()
  //
  //   const rjStateObserver = rj({
  //     effectPipeline: (action$, state$) => {
  //       return action$.pipe(
  //         withLatestFrom(state$),
  //         map(([action, state]) => {
  //           testMaState(state)
  //           return action
  //         })
  //       )
  //     },
  //   })
  //   const maRjState = rj(rjStateObserver, mockFn)
  //
  //   const { result } = renderHook(() =>
  //     useRj(maRjState, (state, { getData }) => ({
  //       pending: state.pending,
  //       friends: getData(state),
  //     }))
  //   )
  //
  //   await act(async () => {
  //     result.current[1].run()
  //   })
  //   expect(mockFn).toHaveBeenCalledTimes(1)
  //   expect(testMaState).nthCalledWith(1, {
  //     pending: false,
  //     data: null,
  //     error: null,
  //   })
  //   await act(async () => {
  //     result.current[1].run()
  //   })
  //   expect(mockFn).toHaveBeenCalledTimes(2)
  //   expect(testMaState).nthCalledWith(2, {
  //     pending: true,
  //     data: null,
  //     error: null,
  //   })
  //   await act(async () => {
  //     resolves[0]('LuX')
  //     resolves[1]('Albi1312')
  //   })
  //   await act(async () => {
  //     result.current[1].run()
  //   })
  //   expect(testMaState).nthCalledWith(3, {
  //     pending: false,
  //     data: 'Albi1312',
  //     error: null,
  //   })
  // })
  //
  // it('should mantein the same return instance while state remain the same', () => {
  //   const MaRjState = rj(() => {})
  //
  //   const { result, rerender } = renderHook(() => useRj(MaRjState))
  //
  //   let out = result.current
  //
  //   rerender({ giova: 23 })
  //
  //   expect(out).toBe(result.current)
  // })
  //
  // test.todo('Test onSuccess onFailure')
  //
  // test.todo('Test actions')
})
