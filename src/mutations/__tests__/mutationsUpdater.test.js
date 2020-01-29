import React from 'react'
import { rj } from '../../rocketjump'
import useRj from '../../hooks/useRj'
import { renderHook, act } from '@testing-library/react-hooks'
import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { createRealStoreWithSagaAndReducer } from '../../testUtils'

const MUTATION_PREFIX = '@MUTATION'
const RJ_PREFIX = '@RJ'

describe('RJ mutations updater', () => {
  it('should be called on mutation SUCCESS with current rj state and the effect result', async () => {
    const mockUpdater = jest.fn()

    const MaRjState = rj({
      mutations: {
        muta: {
          effect: (shouldResolve = true) =>
            shouldResolve ? Promise.resolve(23) : Promise.reject(false),
          updater: mockUpdater,
        },
      },
      type: 'BABU',
      state: 'babu',
      effect: () => Promise.resolve(true),
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
    expect(mockUpdater).not.toHaveBeenCalled()
    await act(async () => {
      result.current[1].muta()
    })
    expect(mockUpdater).toHaveBeenNthCalledWith(
      1,
      {
        data: null,
        error: null,
        loading: false,
      },
      23
    )
    await act(async () => {
      result.current[1].muta(false)
    })
    expect(mockUpdater).toBeCalledTimes(1)
  })
  it('should be used as updater for main state', () => {
    const MaRjState = rj({
      mutations: {
        muta: {
          effect: Promise.resolve(true),
          updater: (state, data) => ({
            ...state,
            data: 'My name WAS ~ ' + data,
          }),
        },
      },
      type: 'BABU',
      state: 'babu',
      effect: () => Promise.resolve(true),
    })()

    let state = MaRjState.reducer(undefined, { type: 'XxXxxxxxX' })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: null,
    })
    const baseMutationType = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}`
    // Not realted mutation ...
    state = MaRjState.reducer(state, {
      type: `${baseMutationType}/socio/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: null,
    })
    state = MaRjState.reducer(state, {
      type: `${baseMutationType}/muta/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: 'My name WAS ~ GioVa',
    })
  })
  it('should can be a string with the name of action creator used as updater for main state', () => {
    const MaRjState = rj(
      rj({
        actions: () => ({
          fixMaState: name => ({
            type: 'FIX_MA',
            payload: name,
          }),
        }),
        composeReducer: (state, action) => {
          if (action.type === 'FIX_MA') {
            return { ...state, data: 'The King Was ' + action.payload }
          }
          return state
        },
      }),
      {
        type: 'BABU',
        state: 'babu',
        mutations: {
          muta: {
            effect: () => {},
            updater: 'fixMaState',
          },
        },
        effect: () => {},
      }
    )()

    const baseMutationType = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}`
    let state = MaRjState.reducer(undefined, { type: 'OoOooOoo' })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: null,
    })
    // Not realted mutation ...
    state = MaRjState.reducer(state, {
      type: `${baseMutationType}/socio/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: null,
    })
    state = MaRjState.reducer(state, {
      type: `${baseMutationType}/muta/SUCCESS`,
      meta: {},
      payload: { data: 'GioVa' },
    })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: 'The King Was GioVa',
    })
  })
})
