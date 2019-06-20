import { rj } from '../rocketjump'
import rjUpdate from '../plugins/update'

describe('Update plugin', () => {
  it('should make update actions creators', () => {
    const {
      actions: { update: updateHuman },
    } = rj(rjUpdate(), {
      type: 'UPDATE_HUMAN',
      state: 'humans',
    })()
    expect(updateHuman({ name: 'Gio Va', id: 23 })).toEqual({
      type: 'UPDATE_HUMAN',
      payload: { params: { name: 'Gio Va', id: 23 } },
      meta: { id: 23 },
    })
  })
})
