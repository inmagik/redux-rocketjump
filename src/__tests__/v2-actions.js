import rj from '../rj'


// rjOperation
// '@updateAssets/OPERATION_LOADING'

rj(rjMagic(), {
  namespace: '@starAssets',
  effects: {
    star: (data = {}, meta = {}) => 23,
  },

})

describe('rj actions', () => {

  it('XXX', () => {
    const { actionTypes } = rj({
      namespace: '@giova',
      // actions: () => ({
      //   fetch: (data = {}, params = {})
      // }),
      actionTypes: ns => ({
        INC: `${ns}INC`,
      })
    })()

    expect(actionTypes).toEqual({
      FETCH: '@giova/FETCH',
    })

  })


})
