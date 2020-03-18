import React from 'react'
import { rj } from '../../../rocketjump'
import useRj from '../../../hooks/useRj'
import { renderHook, act } from '@testing-library/react-hooks'
import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { createRealStoreWithSagaAndReducer } from '../../../testUtils'
import multiMutation from '../multi'

describe('RJ standard mutation multi', () => {
  it('should handle multi mutation per time', async () => {
    let _resolves = []
    let _rejects = []
    const submit = jest.fn(
      () =>
        new Promise((resolve, reject) => {
          _resolves.push(resolve)
          _rejects.push(reject)
        })
    )
    const maRjState = rj({
      mutations: {
        submitForm: multiMutation(a => a, {
          effect: submit,
          updater: 'updateData',
        }),
      },
      type: 'BABU',
      state: 'babu',
      effect: () => Promise.resolve(1312),
    })()

    const ReduxWrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    )

    const [store] = createRealStoreWithSagaAndReducer(
      maRjState.saga,
      combineReducers({
        babu: maRjState.reducer,
      })
    )

    const { result } = renderHook(() => useRj(maRjState), {
      wrapper: ReduxWrapper,
    })
    await act(async () => {
      result.current[1].submitForm(1)
    })
    await act(async () => {
      result.current[1].submitForm(2)
    })
    await act(async () => {
      result.current[1].submitForm(1)
    })
    await act(async () => {
      result.current[1].submitForm(2)
    })
    expect(store.getState().babu.mutations.submitForm).toEqual({
      pendings: {
        2: true,
        1: true,
      },
      errors: {},
    })
    expect(submit).toHaveBeenCalledTimes(2)
    await act(async () => {
      _resolves[0]('DRAK0')
    })
    expect(store.getState().babu.mutations.submitForm).toEqual({
      pendings: {
        2: true,
      },
      errors: {},
    })
    await act(async () => {
      _rejects[1]('Buuu')
    })
    expect(store.getState().babu.mutations.submitForm).toEqual({
      pendings: {},
      errors: {
        2: 'Buuu',
      },
    })
  })
})
