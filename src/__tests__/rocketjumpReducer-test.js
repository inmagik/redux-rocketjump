import { rj } from '../rocketjump'

describe('Rocketjump reducer', () => {
  const type = 'GET_SOCI'
  const state = 'soci'
  const { reducer } = rj({
    type,
    state,
  })()

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '@' })).toEqual({
      loading: false,
      data: null,
      error: null,
    })
  })

  it('should handle $type_LOADING actions', () => {
    const prevState = {
      loading: false,
      data: 'oooo',
      error: null,
    }
    expect(reducer(prevState, { type: `${type}_LOADING` })).toEqual({
      loading: true,
      data: 'oooo',
      error: null,
    })
  })

  it('should handle $type_FAILURE actions', () => {
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_FAILURE`, error: true, payload: 'Shiiit' })
    ).toEqual({
      loading: false,
      data: null,
      error: 'Shiiit',
    })
  })

  it('should handle $type_SUCCESS actions', () => {
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_SUCCESS`, payload: { data: 'Yeah' } })
    ).toEqual({
      loading: false,
      data: 'Yeah',
      error: null,
    })
  })

  it('should handle $type_UNLOAD actions', () => {
    const prevState = {
      loading: true,
      data: 'Where is my mind?',
      error: 'Lot of',
      loller: 23,
    }
    expect(reducer(prevState, { type: `${type}_UNLOAD` })).toEqual({
      loading: false,
      data: null,
      error: null,
      loller: 23,
    })
  })

  it('should use dataReducer to provide new data value', () => {
    const { reducer } = rj({
      type,
      state,
      dataReducer: (prevState, { type, payload: { data } }) =>
        data + ' is fresh!',
    })()
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_SUCCESS`, payload: { data: 'Maik' } })
    ).toEqual({
      loading: false,
      data: 'Maik is fresh!',
      error: null,
    })
  })

  it('should be proxable', () => {
    const { reducer } = rj({
      type,
      state,
      proxyReducer: givenReducer => {
        return (prevState, action) => {
          const nextState = givenReducer(prevState, action)
          if (action.type === `${type}_SUCCESS`) {
            return { ...nextState, cool: nextState.data + ' is cool' }
          }
          return nextState
        }
      },
    })()
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_SUCCESS`, payload: { data: 'Maik' } })
    ).toEqual({
      loading: false,
      data: 'Maik',
      cool: 'Maik is cool',
      error: null,
    })
  })
})
