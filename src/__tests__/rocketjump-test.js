import { rocketjump } from '../core'

describe('Rocketjump', () => {

  const type = 'GET_SOCI'
  const state = 'soci'

  it('should make standard actions', () => {
    expect(
      rocketjump({
        type,
        state,
      })()
      .actions
      .load({ name: 'Giova' }, { killEnemies: true })
    ).toEqual({
      type,
      payload: {
        params: {
          name: 'Giova',
        },
      },
      meta: {
        killEnemies: true,
      },
    })
  })

  it('should make actions proxable', () => {
  //   expect(
  //     rocketjump({
  //       type,
  //       state,
  //     })()
  //     .actions
  //     .load({ name: 'Giova' }, { killEnemies: true })
  //   ).toEqual({
  //     type,
  //     payload: {
  //       params: {
  //         name: 'Giova',
  //       },
  //     },
  //     meta: {
  //       killEnemies: true,
  //     },
  //   })
  })

})
