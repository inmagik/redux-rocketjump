import { rj } from '../rocketjump'
import rjDelete  from '../catalogs/delete'

describe('rjDelete', () => {
  it('should make delete actions creators', () => {
    const { actions: { load: deleteHuman } } = rj(
      rjDelete,
      {
        type: 'DELETE_HUMAN',
        state: 'humans',
      }
    )()
    expect(deleteHuman(23)).toEqual({
      type: 'DELETE_HUMAN',
      payload: { params: { id: 23 } },
      meta: { id: 23 }
    })
  })
})
