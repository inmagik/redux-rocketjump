import React from 'react'
import { rj } from '../../rocketjump'
import rjMiddleware from '../../rjMiddleware'
import useRj from '../../hooks/useRj'
import { renderHook, act } from '@testing-library/react-hooks'
import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { Provider } from 'react-redux'

const MUTATION_PREFIX = '@MUTATION'
const RJ_PREFIX = '@RJ'

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
