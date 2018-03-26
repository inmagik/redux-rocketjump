import { rocketjump } from '../rocketjump'

describe('Rocketjump', () => {
  it('should throw exception when no type is provided', () => {
    expect(
      rocketjump({
        state: 'soci',
      })
    ).toThrow()
  })
  it('should throw exception when no state is provided', () => {
    expect(
      rocketjump({
        type: 'GET_SOCI',
      })
    ).toThrow()
  })
})
