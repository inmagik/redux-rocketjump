import { rj } from '../rocketjump'

const spy = jest.spyOn(global.console, 'warn')

describe('rj bad warnings', () => {
  it('shoud warn when last invocation contains something', () => {
    spy.mockReset()

    rj()({
      type: 'CIAO',
      state: 'ciao',
      effect: () => {},
    })

    expect(spy).toHaveBeenCalled()
  })
  it('should warn if type is defined twice', () => {
    spy.mockReset()

    const rj1 = rj({
      type: 'x',
    })

    const rj2 = rj(rj1, {
      type: 'y',
      state: 'y',
      effect: () => {},
    })

    // eslint-disable-next-line no-unused-vars
    const result = rj2()

    expect(spy).toHaveBeenCalled()
  })
  it('should warn if state is defined twice', () => {
    spy.mockReset()

    const rj1 = rj({
      state: 'x',
    })

    const rj2 = rj(rj1, {
      type: 'y',
      state: 'y',
      effect: () => {},
    })

    // eslint-disable-next-line no-unused-vars
    const result = rj2()

    expect(spy).toHaveBeenCalled()
  })
  it('should warn if api is defined twice', () => {
    spy.mockReset()

    const rj1 = rj({
      effect: () => {},
    })

    const rj2 = rj(rj1, {
      type: 'y',
      state: 'y',
      effect: () => {},
    })

    // eslint-disable-next-line no-unused-vars
    const result = rj2()

    expect(spy).toHaveBeenCalled()
  })
  it('should warn if type is defined earlier', () => {
    spy.mockReset()

    // eslint-disable-next-line no-unused-vars
    const result = rj(
      {
        type: 'x',
      },
      {
        effect: () => {},
        state: 'x',
      }
    )()

    expect(spy).toHaveBeenCalled()
  })
  it('should warn if state is defined earlier', () => {
    spy.mockReset()

    // eslint-disable-next-line no-unused-vars
    const result = rj(
      {
        state: 'x',
      },
      {
        effect: () => {},
        type: 'x',
      }
    )()

    expect(spy).toHaveBeenCalled()
  })
  it('should warn if api is defined earlier', () => {
    spy.mockReset()

    // eslint-disable-next-line no-unused-vars
    const result = rj(
      {
        effect: () => {},
      },
      {
        type: 'x',
        state: 'x',
      }
    )()

    expect(spy).toHaveBeenCalled()
  })
  it('should not warn if everything is ok', () => {
    spy.mockReset()

    const rj1 = rj({})

    const rj2 = rj({})

    const rj3 = rj(rj1, rj2)

    // eslint-disable-next-line no-unused-vars
    const rj4 = rj(rj3, {
      type: 'r',
      effect: () => {},
      state: 'aa',
    })()

    expect(spy).not.toHaveBeenCalled()
  })
  it('should not warn if object is not the last item in the call', () => {
    spy.mockReset()

    const rj1 = rj({})

    const rj2 = rj({})

    const rj3 = rj(rj1, rj2)

    const rj5 = rj({})

    // eslint-disable-next-line no-unused-vars
    const rj4 = rj(
      rj3,
      {
        type: 'r',
        effect: () => {},
        state: 'aa',
      },
      rj5
    )()

    expect(spy).not.toHaveBeenCalled()
  })
  it('should not warn if there are several well-formatted objects', () => {
    spy.mockReset()

    const rj1 = rj({})

    const rj2 = rj({})

    const rj3 = rj(rj1, rj2)

    // eslint-disable-next-line no-unused-vars
    const rj4 = rj(
      rj3,
      {},
      {},
      {
        type: 'r',
        effect: () => {},
        state: 'aa',
      }
    )()

    expect(spy).not.toHaveBeenCalled()
  })
})
