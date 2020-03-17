import React from 'react'
import { deps } from 'rocketjump-core'
import { renderHook, act } from '@testing-library/react-hooks'
import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { rj } from '../../rocketjump'
import useRjActions from '../useRjActions'
import { createRealStoreWithSagaAndReducer } from '../../testUtils'

describe('useRjActions', () => {
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

    const { result } = renderHook(() => useRjActions(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current.run.withMeta({ giova: 23 }).run('Un', 'Dos', 'Tres')
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

  it('should get angry with a non rj object is passed as argument', () => {
    expect(() => {
      useRjActions(rj())
    }).toThrowError(
      /\[redux-rocketjump\] You should provide a rj object to useRjActions/
    )
    expect(() => {
      useRjActions(23)
    }).toThrowError(
      /\[redux-rocketjump\] You should provide a rj object to useRjActions/
    )
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

    const { result } = renderHook(() => useRjActions(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current.run
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

    const { result } = renderHook(() => useRjActions(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current.run
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

    const { result, unmount } = renderHook(() => useRjActions(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current.run
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

  it('should squash deps values', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
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

    const { result } = renderHook(() => useRjActions(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current.run(
        1,
        2,
        deps.maybe(3),
        deps.maybeGet({ name: 'Giova' }, 'name')
      )
    })
    expect(actionsLog[0]).toEqual({
      type: 'GET_FRIENDS',
      payload: {
        params: [1, 2, 3, 'Giova'],
      },
      meta: {
        rjCallId: expect.any(Number),
      },
    })
  })

  it('should squash deps meta', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
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

    const { result } = renderHook(() => useRjActions(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current.run
        .withMeta({ x: 3 })
        .run(
          1,
          deps.withMeta(2, { rinne: 2 }),
          deps.maybe(3).withMeta({ x: 2 }),
          deps.withAlwaysMeta({ giova: 33 }),
          deps.maybeGet({ name: 'Giova' }, 'name')
        )
    })
    expect(actionsLog[0]).toEqual({
      type: 'GET_FRIENDS',
      payload: {
        params: [1, 2, 3, 'Giova'],
      },
      meta: {
        rinne: 2,
        x: 3,
        giova: 33,
        rjCallId: expect.any(Number),
      },
    })
  })

  it('should skip run according to deps', async () => {
    const mockEffect = jest.fn().mockResolvedValue(23)
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

    const { result } = renderHook(() => useRjActions(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current.run
        .withMeta({ x: 3 })
        .run(
          1,
          deps.withMeta(2, { rinne: 2 }),
          deps.maybe(0).withMeta({ x: 2 }),
          deps.withAlwaysMeta({ giova: 33 }),
          deps.maybeGet({ name: 'Giova' }, 'name')
        )
    })
    expect(actionsLog).toEqual([])
  })
})
