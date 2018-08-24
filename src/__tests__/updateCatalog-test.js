import { rj } from '../rocketjump'
import rjUpdate  from '../catalogs/update'

describe('rjUpdate', () => {
  it('should make update actions creators', () => {
    const { actions: { load: updateHuman } } = rj(
      rjUpdate,
      {
        type: 'UPDATE_HUMAN',
        state: 'humans',
      }
    )()
    expect(updateHuman({ name: 'Gio Va', id: 23 })).toEqual({
      type: 'UPDATE_HUMAN',
      payload: { params: { name: 'Gio Va', id: 23 } },
      meta: { id: 23 }
    })
  })
})
