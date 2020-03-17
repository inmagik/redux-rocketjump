import React from 'react'
import { rj } from '../../../rocketjump'
import useRj from '../../../hooks/useRj'
import { renderHook, act } from '@testing-library/react-hooks'
import { combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { createRealStoreWithSagaAndReducer } from '../../../testUtils'
import singleMutation from '../single'

describe('RJ standard mutation single', () => {
  it('should handle a mutation effect per time', async () => {
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
        submitForm: singleMutation({
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
      result.current[1].submitForm()
    })
    await act(async () => {
      result.current[1].submitForm()
    })
    await act(async () => {
      result.current[1].submitForm()
    })
    expect(store.getState().babu.mutations.submitForm).toEqual({
      pending: true,
      error: null,
    })
    expect(submit).toHaveBeenCalledTimes(1)
    await act(async () => {
      _resolves[0]('DRAK0')
    })
    expect(store.getState().babu.mutations.submitForm).toEqual({
      pending: false,
      error: null,
    })
    expect(store.getState().babu.root).toEqual({
      data: 'DRAK0',
      loading: false,
      error: null,
    })
    await act(async () => {
      result.current[1].submitForm()
    })
    await act(async () => {
      result.current[1].submitForm()
    })
    await act(async () => {
      result.current[1].submitForm()
    })
    expect(submit).toHaveBeenCalledTimes(2)
    await act(async () => {
      _rejects[1]('KILL3M0N')
    })
    expect(store.getState().babu.mutations.submitForm).toEqual({
      pending: false,
      error: 'KILL3M0N',
    })
  })
})
