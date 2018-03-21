import { rocketjump } from '../core'

describe('Rocketjump reducer', () => {
  const type = 'GET_SOCI'
  const state = 'soci'

  it('should return the initial state', () => {
    const { reducer } = rocketjump({
      type,
      state,
    })()
    expect(reducer(undefined, { type: '@' })).toEqual({
      loading: false,
      data: null,
      error: null,
    })
  })

  it('should handle $type_LOADING actions', () => {
    const { reducer } = rocketjump({
      type,
      state,
    })()
    const prevState = {
      loading: false,
      data: null,
      error: null,
    }
    expect(reducer(prevState, { type: `${type}_LOADING` })).toEqual({
      loading: true,
      data: null,
      error: null,
    })
  })
})
