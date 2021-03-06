import { rj } from '../../../rocketjump'
import { createMockStoreWithSaga } from '../../../testUtils'
import rjPosArgs from '../index'

describe('Positional args plugin', () => {
  it('should able to run action creator using positional arguments instead of objects', () => {
    const api = jest.fn()
    const {
      actions: { load },
      saga,
    } = rj(rjPosArgs(), {
      type: 'SOOCIO~',
      state: 'ocio',
      effect: api,
      /* eslint-disable require-yield */
      effectExtraParams: function*(params, meta) {
        return [...params, 'King Redeem / Queen serene']
      },
    })()
    const store = createMockStoreWithSaga(saga)
    store.dispatch(load(23, 777))
    expect(api.mock.calls[0][0]).toBe(23)
    expect(api.mock.calls[0][1]).toBe(777)
    expect(api.mock.calls[0][2]).toBe('King Redeem / Queen serene')
  })

  it('should able to map positional arguments to meta', () => {
    const api = jest.fn()
    const type = 'SOOCIO~'
    const {
      actions: { load },
    } = rj(rjPosArgs('id'), {
      type,
      state: 'ocio',
      effect: api,
    })()

    expect(load(23)).toEqual({
      type,
      payload: { params: [23] },
      meta: { id: 23 },
    })

    const {
      actions: { load: load2 },
    } = rj(rjPosArgs('id', null, false, 'tek', 'isCool'), {
      type,
      state: 'ocio',
      effect: api,
    })()

    expect(load2(777, 'maik', 'giova', 23)).toEqual({
      type,
      payload: { params: [777, 'maik', 'giova', 23] },
      meta: { id: 777, tek: 23 },
    })
  })
})
