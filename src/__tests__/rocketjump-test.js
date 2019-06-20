import { rj } from '../rocketjump'

describe('Rocketjump', () => {
  it('should throw exception when no type is provided', () => {
    expect(
      rj({
        state: 'soci',
      })
    ).toThrow()
  })
  it('should throw exception when no state is provided', () => {
    expect(
      rj({
        type: 'GET_SOCI',
      })
    ).toThrow()
  })
  it('should not throw exception when state is set explicit to false', () => {
    expect(
      rj({
        state: false,
        type: 'GET_SOCI',
      })
    ).not.toThrow()
  })
  it('should handle the configuration of rocketjump in the __rjconfig field', () => {
    expect(
      rj(
        {
          coolestGuyInDaWorld: 'Gio Va aka Fu Mello',
          type: 'GET_SOCI',
        },
        {
          yeah: 23,
        },
        {
          rateLimit: 99,
        }
      ).__rjconfig
    ).toEqual({
      coolestGuyInDaWorld: 'Gio Va aka Fu Mello',
      type: 'GET_SOCI',
      rateLimit: 99,
      yeah: 23,
    })
  })
  it('should ignore when try to override the exports from outside', () => {
    expect(
      rj({
        type: 'HARMLESS_TYPE',
        state: 'HARMLESS_STATE',
        api: () => {},
      })(undefined, {
        reducer: () => 'KILL ALL HUMANS',
      }).reducer(
        // Call the reducer as redux did
        undefined,
        { type: 'HELLO@REDUX' }
      )
    ).not.toBe('KILL ALL HUMANS')
  })
})
