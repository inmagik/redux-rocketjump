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
})
