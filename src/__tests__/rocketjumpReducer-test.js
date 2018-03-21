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
})
