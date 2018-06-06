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
  it('should handle the configuration of rocketjump in the config field', () => {
    expect(
      rj({
        coolestGuyInDaWorld: 'Gio Va aka Fu Mello',
        type: 'GET_SOCI',
      }, {
        yeah: 23,
      }, {
        rateLimit: 99,
      }).config
    ).toEqual({
      coolestGuyInDaWorld: 'Gio Va aka Fu Mello',
      type: 'GET_SOCI',
      rateLimit: 99,
      yeah: 23,
    })
  })
})
