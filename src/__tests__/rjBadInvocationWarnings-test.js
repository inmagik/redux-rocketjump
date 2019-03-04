import { rj } from '../rocketjump'

describe('rj bad warnings', () => {
  it('shoud warn when last invocation contains something', () => {
    const spy = jest.spyOn(global.console, 'warn')

    rj()({
      type: 'CIAO',
      state: 'ciao',
      api: () => {},
    })

    expect(spy).toHaveBeenCalled()
  })
})
