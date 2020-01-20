import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { rj } from '../rocketjump'
import useRunRj from '../useRunRj'

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

describe('useRunRj', () => {
  it('should run rj on mount', async () => {
    let _resolves = []
    const mockApi = jest.fn(
      () =>
        new Promise(resolve => {
          _resolves.push(resolve)
        })
    )
    const MyRjState = rj({
      type: 'GET_KING',
      state: 'theKing',
      effect: mockApi,
    })()

    const store = createRealStoreWithSagaAndReducer(
      MyRjState.saga,
      combineReducers({
        theKing: MyRjState.reducer,
      })
    )[0]

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const { rerender, result } = renderHook(
      ({ id }) => useRunRj(MyRjState, [id]),
      {
        wrapper: ReduxWrapper,
        initialProps: { id: 23 },
      }
    )

    // Pending effect
    expect(result.current[0]).toEqual({
      data: null,
      loading: true,
      error: null,
    })
    expect(mockApi).toHaveBeenNthCalledWith(1, 23)
    rerender({ id: 1312 })
    // Api called \w new argument
    expect(mockApi).toHaveBeenNthCalledWith(2, 1312)

    // Resolve the first promise ....
    await act(async () => _resolves[0]('Gio Va'))
    // Rj correct ignore this and still in loading
    expect(result.current[0]).toEqual({
      data: null,
      loading: true,
      error: null,
    })

    // Resolve the second promise and ok!
    await act(async () => _resolves[1]('Gio Va'))
    expect(result.current[0]).toEqual({
      data: 'Gio Va',
      loading: false,
      error: null,
    })
    rerender({ id: 777 })
    expect(mockApi).toHaveBeenNthCalledWith(3, 777)
    // Clean up
    expect(result.current[0]).toEqual({
      data: null,
      loading: true,
      error: null,
    })
    await act(async () => _resolves[2]('Al Bi'))
    expect(result.current[0]).toEqual({
      data: 'Al Bi',
      loading: false,
      error: null,
    })
  })

  // it('should run rj in respect of deps', async () => {
  //   let _resolves = []
  //   const mockApi = jest.fn(
  //     () =>
  //       new Promise(resolve => {
  //         _resolves.push(resolve)
  //       })
  //   )
  //   const MyRjState = rj(mockApi)
  //
  //   const { rerender, result } = renderHook(
  //     ({ id, roles, agency }) => useRunRj(MyRjState, [id, roles, agency]),
  //     {
  //       initialProps: {
  //         id: 23,
  //         roles: ['king', 'boss', ['party', 'rulez']],
  //         agency: {
  //           name: 'INMAGIK',
  //           people: ['mauro', 'giova'],
  //         },
  //       },
  //     }
  //   )
  //
  //   // Pending effect
  //   expect(result.current[0]).toEqual({
  //     data: null,
  //     pending: true,
  //     error: null,
  //   })
  //   expect(mockApi).toHaveBeenNthCalledWith(
  //     1,
  //     // Call \w deps
  //     23,
  //     ['king', 'boss', ['party', 'rulez']],
  //     {
  //       name: 'INMAGIK',
  //       people: ['mauro', 'giova'],
  //     }
  //   )
  //   rerender({
  //     id: 1312,
  //     roles: ['useless', 'boy'],
  //     agency: ['INMAGIK', 'evilcorp'],
  //   })
  //   // Api called \w new argument
  //   expect(mockApi).toHaveBeenNthCalledWith(
  //     2,
  //     // Call \w deps
  //     1312,
  //     ['useless', 'boy'],
  //     ['INMAGIK', 'evilcorp']
  //   )
  //   // Resolve the first promise ....
  //   await act(async () => _resolves[0]('Gio Va'))
  //   // Rj correct ignore this and still in pending
  //   expect(result.current[0]).toEqual({
  //     data: null,
  //     pending: true,
  //     error: null,
  //   })
  //   // Resolve the second promise and ok!
  //   await act(async () => _resolves[1]('Gio Va'))
  //   expect(result.current[0]).toEqual({
  //     data: 'Gio Va',
  //     pending: false,
  //     error: null,
  //   })
  //   rerender({ id: 777 })
  //   expect(mockApi).toHaveBeenNthCalledWith(3, 777, undefined, undefined)
  //   // Clean up
  //   expect(result.current[0]).toEqual({
  //     data: null,
  //     pending: true,
  //     error: null,
  //   })
  //   await act(async () => _resolves[2]('Al Bi'))
  //   expect(result.current[0]).toEqual({
  //     data: 'Al Bi',
  //     pending: false,
  //     error: null,
  //   })
  // })
  //
  // it('should run rj on mount and avoid clean when specified', async () => {
  //   let _resolves = []
  //   const mockApi = jest.fn(
  //     () =>
  //       new Promise(resolve => {
  //         _resolves.push(resolve)
  //       })
  //   )
  //   const MyRjState = rj(mockApi)
  //
  //   const { rerender, result } = renderHook(
  //     ({ id }) => useRunRj(MyRjState, [id], false),
  //     {
  //       initialProps: { id: 23 },
  //     }
  //   )
  //
  //   // Pending effect
  //   expect(result.current[0]).toEqual({
  //     data: null,
  //     pending: true,
  //     error: null,
  //   })
  //   expect(mockApi).toHaveBeenNthCalledWith(1, 23)
  //   rerender({ id: 1312 })
  //   // Api called \w new argument
  //   expect(mockApi).toHaveBeenNthCalledWith(2, 1312)
  //
  //   // Resolve the first promise ....
  //   await act(async () => _resolves[0]('Gio Va'))
  //   // Rj correct ignore this and still in pending
  //   expect(result.current[0]).toEqual({
  //     data: null,
  //     pending: true,
  //     error: null,
  //   })
  //
  //   // Resolve the second promise and ok!
  //   await act(async () => _resolves[1]('Gio Va'))
  //   expect(result.current[0]).toEqual({
  //     data: 'Gio Va',
  //     pending: false,
  //     error: null,
  //   })
  //   rerender({ id: 777 })
  //   expect(mockApi).toHaveBeenNthCalledWith(3, 777)
  //   // Not clean up, but still pending
  //   expect(result.current[0]).toEqual({
  //     data: 'Gio Va',
  //     pending: true,
  //     error: null,
  //   })
  //   await act(async () => _resolves[2]('Al Bi'))
  //   expect(result.current[0]).toEqual({
  //     data: 'Al Bi',
  //     pending: false,
  //     error: null,
  //   })
  // })
  //
  // it('should mantein the same return instance while state remain the same', () => {
  //   const MaRjState = rj(() => {})
  //
  //   const { result, rerender } = renderHook(() => useRunRj(MaRjState))
  //
  //   let out = result.current
  //
  //   rerender({ giova: 23 })
  //
  //   expect(out).toBe(result.current)
  // })
})
