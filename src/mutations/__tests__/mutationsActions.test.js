import React from 'react'
import { rj } from '../../rocketjump'
import useRj from '../../hooks/useRj'
import { renderHook, act } from '@testing-library/react-hooks'
import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { createRealStoreWithSagaAndReducer } from '../../testUtils'

const MUTATION_PREFIX = '@MUTATION'
const RJ_PREFIX = '@RJ'

describe('RJ mutations action creators', () => {
  it('should be generated from mutations and generate good actions', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          effect: () => Promise.resolve(23),
          updater: s => s,
        },
        cookSpaghetti: {
          effect: () => Promise.resolve('Ok B00M3R'),
          updater: s => s,
        },
      },
      type: 'BABU',
      state: 'babu',
      effect: () => Promise.resolve(1312),
    })()

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const [store, actionsLog] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        babu: maRjState.reducer,
      })
    )

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current[1].killHumans('Giova', 23)
    })

    const mainType1 = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/killHumans`
    expect(actionsLog).toEqual([
      {
        type: `${mainType1}`,
        payload: {
          params: ['Giova', 23],
        },
        meta: {
          params: ['Giova', 23],
          rjCallId: expect.any(Number),
        },
      },
      {
        type: `${mainType1}/LOADING`,
        meta: {
          params: ['Giova', 23],
          rjCallId: expect.any(Number),
        },
      },
      {
        type: `${mainType1}/SUCCESS`,
        payload: {
          params: ['Giova', 23],
          data: 23,
        },
        meta: {
          params: ['Giova', 23],
          rjCallId: expect.any(Number),
        },
      },
    ])

    await act(async () => {
      result.current[1].cookSpaghetti
        .withMeta({ rinne: 'X' })
        .run({ giova: 420 })
    })

    const mainType2 = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/cookSpaghetti`
    expect(actionsLog.slice(-3)).toEqual([
      {
        type: `${mainType2}`,
        payload: {
          params: [{ giova: 420 }],
        },
        meta: {
          params: [{ giova: 420 }],
          rinne: 'X',
          rjCallId: expect.any(Number),
        },
      },
      {
        type: `${mainType2}/LOADING`,
        meta: {
          params: [{ giova: 420 }],
          rinne: 'X',
          rjCallId: expect.any(Number),
        },
      },
      {
        type: `${mainType2}/SUCCESS`,
        payload: {
          params: [{ giova: 420 }],
          data: 'Ok B00M3R',
        },
        meta: {
          params: [{ giova: 420 }],
          rinne: 'X',
          rjCallId: expect.any(Number),
        },
      },
    ])
  })

  it('can be overwritten using a type in mutation config', async () => {
    const maRjState = rj({
      mutations: {
        killHumans: {
          type: 'KILLA_KILL',
          effect: () => Promise.resolve(23),
          updater: s => s,
        },
        cookSpaghetti: {
          effect: () => Promise.resolve('Ok B00M3R'),
          updater: s => s,
        },
      },
      type: 'BABU',
      state: 'babu',
      effect: () => Promise.resolve(1312),
    })()

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const [store, actionsLog] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        babu: maRjState.reducer,
      })
    )

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })

    await act(async () => {
      result.current[1].killHumans('Giova', 23)
    })

    const mainType1 = 'KILLA_KILL'
    expect(actionsLog).toEqual([
      {
        type: `${mainType1}`,
        payload: {
          params: ['Giova', 23],
        },
        meta: {
          params: ['Giova', 23],
          rjCallId: expect.any(Number),
        },
      },
      {
        type: `${mainType1}/LOADING`,
        meta: {
          params: ['Giova', 23],
          rjCallId: expect.any(Number),
        },
      },
      {
        type: `${mainType1}/SUCCESS`,
        payload: {
          params: ['Giova', 23],
          data: 23,
        },
        meta: {
          params: ['Giova', 23],
          rjCallId: expect.any(Number),
        },
      },
    ])
  })

  it('should be warn when a mutation override existing action creator', async () => {
    const spy = jest.fn()

    console.warn = spy
    rj(
      rj({
        actions: () => ({
          killHumans: () => {},
        }),
      }),
      {
        mutations: {
          killHumans: {
            effect: () => {},
            updater: () => {},
          },
        },
        type: 'BABU',
        state: 'BABU',
        effect: () => Promise.resolve(1312),
      }
    )()

    expect(spy.mock.calls[0][0]).toMatch(/\[redux-rocketjump\] @mutations/)
  })
})
