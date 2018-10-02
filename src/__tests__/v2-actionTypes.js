import rj from '../rj'

describe('rj action types', () => {

  it('should be created from actionTypes and namespace', () => {
    const { actionTypes } = rj({
      namespace: '@giova',
      actionTypes: ns => ({
        FETCH: `${ns}FETCH`,
      })
    })()

    expect(actionTypes).toEqual({
      FETCH: '@giova/FETCH',
    })

  })

  it('should be composable', () => {
    const { actionTypes } = rj(
      rj({
        actionTypes: ns => ({
          KILL: `${ns}KILL`,
        })
      }),
      rj({
        actionTypes: ns => ({
          COOL: `${ns}COOL`,
        })
      }),
      {
        namespace: '@giova',
        actionTypes: ns => ({
          FETCH: `${ns}FETCH`,
        })
      }
    )()

    expect(actionTypes).toEqual({
      FETCH: '@giova/FETCH',
      COOL: '@giova/COOL',
      KILL: '@giova/KILL',
    })

  })

  it('should be generated from effects keys', () => {
    const { actionTypes } = rj({
      effects: {
        namespace: 'giova',
        fetch: () => 23,
      },
    })()

    expect(actionTypes).toEqual({
      FETCH: '@giova/FETCH',
      FETCH_LOADING: '@giova/FETCH_LOADING',
      FETCH_SUCCESS: '@giova/FETCH_SUCCESS',
      FETCH_FAILURE: '@giova/FETCH_FAILURE',
      FETCH_UNLOAD: '@giova/FETCH_UNLOAD',
    })
  })

})
