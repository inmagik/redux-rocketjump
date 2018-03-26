import { rocketjump } from '../rocketjump'

describe('Rocketjump side effect descriptor', () => {
  const type = 'GET_SOCI'
  const state = 'soci'
  const noop = () => {}

  it('should be returned only when no saga is generated', () => {
    const rj1 = rocketjump({
      type,
      state,
    })()
    expect(rj1.sideEffect).not.toBe(undefined)
    const rj2 = rocketjump({
      type,
      state,
      api: noop,
    })()
    expect(rj2.sideEffect).toBe(undefined)
  })

  it('should be composable', () => {
    function se1() {}
    function se2() {}
    function se3() {}
    function fe1() {}
    function fe2() {}
    function fe3() {}
    function ep1() {}
    function ep2() {}
    function ep3() {}

    const rj1 = rocketjump({
      type,
      state,
      successEffect: se1,
      failureEffect: fe1,
      apiExtraParams: ep1,
    })
    const rj2 = rocketjump({
      type,
      state,
      successEffect: se2,
      failureEffect: fe2,
      apiExtraParams: ep2,
    })
    const { sideEffect } = rocketjump(rj1, rj2, {
      type,
      state,
      successEffect: se3,
      failureEffect: fe3,
      apiExtraParams: ep3,
    })()
    expect(sideEffect.successEffect[0]).toBe(se1)
    expect(sideEffect.successEffect[1]).toBe(se2)
    expect(sideEffect.successEffect[2]).toBe(se3)
    expect(sideEffect.failureEffect[0]).toBe(fe1)
    expect(sideEffect.failureEffect[1]).toBe(fe2)
    expect(sideEffect.failureEffect[2]).toBe(fe3)
    expect(sideEffect.apiExtraParams[0]).toBe(ep1)
    expect(sideEffect.apiExtraParams[1]).toBe(ep2)
    expect(sideEffect.apiExtraParams[2]).toBe(ep3)
  })
})
