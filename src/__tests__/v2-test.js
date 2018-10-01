import rj from '../rj'

describe('v2', () => {

  it('should be awesome', () => {

    const { actionTypes } = rj(
    rj({
      actionTypes: ns => ({
        FETCH: `${ns}FETCH`,
      })
    }),
    rj({
      actionTypes: ns => ({
        KILL: `${ns}KILL`,
      })
    }),
    {
      namespace: 'giova',
      actionTypes: ns => ({
        CREATE: `${ns}CREATE`,
      })
    })()

    expect(actionTypes).toEqual({
      CREATE: 'giovaCREATE',
      FETCH: 'giovaFETCH',
      KILL: 'giovaKILL',
    })

  })

})
