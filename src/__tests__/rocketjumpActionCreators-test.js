import { rj } from '../rocketjump'

const spyWarn = jest.spyOn(global.console, 'warn')

describe('Rocketjump action creators', () => {
  const type = 'GET_SOCI'
  const state = 'soci'

  it('should be load and unload', () => {
    const { actions } = rj({
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

  it('should be has run and clean alias', () => {
    const { actions } = rj({
      type,
      state,
    })()
    expect(actions.run({ name: 'Giova' }, { killEnemies: true })).toEqual({
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
    expect(actions.clean({ tek: 23 })).toEqual({
      type: `${type}_UNLOAD`,
      meta: {
        tek: 23,
      },
    })
  })

  it('should be proxable', () => {
    const { actions } = rj({
      type,
      state,
      actions: {
        load: ({ load }) => name => load({ name }),
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
    const { actions } = rj({
      type,
      state,
      actions: {
        destoryTheWorld: () => () => ({
          type: 'DESTROY_THE_WORLD',
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
      meta: { more: true },
    })
  })

  it('should be composable', () => {
    const rjUn = rj({
      actions: {
        load: ({ load }) => (un, params, meta) => load({ un, ...params }, meta),
      },
    })

    const rjDos = rj({
      actions: {
        load: ({ load }) => (un, dos, params, meta) =>
          load(un, { dos, ...params }, meta),
      },
    })

    const rjTres = rj(rjUn, rjDos, {
      actions: {
        load: ({ load }) => (un, dos, tres, params, meta) =>
          load(
            un,
            dos,
            {
              ...params,
              tres,
            },
            meta
          ),
      },
    })

    const { actions } = rj(rjTres, {
      type,
      state,
      actions: {
        load: ({ load }) => a =>
          load(
            'Un',
            'Dos',
            'Tres',
            {},
            {
              ammaccabanane: a,
            }
          ),
      },
    })()

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
      },
    })
  })

  it('should still use the old api but with warnings', () => {
    spyWarn.mockReset()
    const { actions } = rj({
      type,
      state,
      proxyActions: {
        load: ({ load }) => name => load({ name }),
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
    expect(spyWarn).toHaveBeenCalled()
  })
})
