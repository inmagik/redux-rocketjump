import { rocketjump } from '../core'

describe('Rocketjump action creators', () => {
  const type = 'GET_SOCI'
  const state = 'soci'

  it('should be load and unload', () => {
    const { actions } = rocketjump({
      type,
      state,
    })()
    expect(actions.load({ name: 'Giova' }, { killEnemies: true })).toEqual({
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
    expect(actions.unload({ tek: 23 })).toEqual({
      type: `${type}_UNLOAD`,
      meta: {
        tek: 23,
      },
    })
  })

  it('should be proxable', () => {
    const { actions } = rocketjump({
      type,
      state,
      proxyActions: {
        load: ({ load }) => name => load({ name })
      },
    })()

    expect(actions.load('Giova')).toEqual({
      type,
      payload: {
        params: {
          name: 'Giova',
        },
      },
      meta: {},
    })
  })

  it('should be extendible', () => {
    const { actions } = rocketjump({
      type,
      state,
      proxyActions: {
        destoryTheWorld: () => () => ({
          type: 'DESTROY_THE_WORLD'
        }),
        loadMore: ({ load }) => (params, meta) =>
          load(params, { ...meta, more: true }),
      },
    })()
    expect(actions.destoryTheWorld()).toEqual({
      type: 'DESTROY_THE_WORLD',
    })
    expect(actions.loadMore()).toEqual({
      type,
      payload: { params: {} },
      meta: { more: true }
    })
  })

  it('should be composable', () => {
    const rjUn = rocketjump({
      proxyActions: {
        load: ({ load }) => (un, params, meta) =>
          load({ un, ...params }, meta)
      },
    })

    const rjDos = rocketjump({
      proxyActions: {
        load: ({ load }) => (un, dos, params, meta) =>
          load(un, { dos, ...params }, meta)
      },
    })

    const { actions } = rocketjump(rjUn, rjDos, {
      type,
      state,
      proxyActions: {
        load: ({ load }) => (un, dos, tres, params, meta) => load(un, dos, {
          ...params,
          tres,
        }, meta),
      },
    })({
      proxyActions: {
        load: ({ load }) => (a) => load('Un', 'Dos', 'Tres', {}, {
          ammaccabanane: a,
        })
      },
    })

    expect(actions.load('JD')).toEqual({
      type,
      payload: {
        params: {
          un: 'Un',
          dos: 'Dos',
          tres: 'Tres',
        },
      },
      meta: {
        ammaccabanane: 'JD',
      }
    })
  })

})
