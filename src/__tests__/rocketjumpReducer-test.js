import { rj } from '../rocketjump'

const spyWarn = jest.spyOn(global.console, 'warn')

describe('Rocketjump reducer', () => {
  const type = 'GET_SOCI'
  const state = 'soci'
  const { reducer } = rj({
    type,
    state,
  })()

  it('should be undefined when state is explicit set to false', () => {
    expect(
      rj({ type: 'DESTROY_HUMANS', state: false })().reducer
    ).toBeUndefined()
  })

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '@' })).toEqual({
      loading: false,
      data: null,
      error: null,
    })
  })

  it('should handle $type_LOADING actions', () => {
    const prevState = {
      loading: false,
      data: 'oooo',
      error: null,
    }
    expect(reducer(prevState, { type: `${type}_LOADING` })).toEqual({
      loading: true,
      data: 'oooo',
      error: null,
    })
  })

  it('should handle $type_FAILURE actions', () => {
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, {
        type: `${type}_FAILURE`,
        error: true,
        payload: 'Shiiit',
      })
    ).toEqual({
      loading: false,
      data: null,
      error: 'Shiiit',
    })
  })

  it('should handle $type_SUCCESS actions', () => {
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_SUCCESS`, payload: { data: 'Yeah' } })
    ).toEqual({
      loading: false,
      data: 'Yeah',
      error: null,
    })
  })

  it('should handle $type_UNLOAD actions', () => {
    const prevState = {
      loading: true,
      data: 'Where is my mind?',
      error: 'Lot of',
      loller: 23,
    }
    expect(reducer(prevState, { type: `${type}_UNLOAD` })).toEqual({
      loading: false,
      data: null,
      error: null,
      loller: 23,
    })
  })

  it('should use dataReducer to provide new data value', () => {
    const { reducer } = rj({
      type,
      state,
      dataReducer: (prevState, { type, payload: { data } }) =>
        data + ' is fresh!',
    })()
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_SUCCESS`, payload: { data: 'Maik' } })
    ).toEqual({
      loading: false,
      data: 'Maik is fresh!',
      error: null,
    })
  })

  it('should be proxable', () => {
    const { reducer } = rj({
      type,
      state,
      reducer: givenReducer => {
        return (prevState, action) => {
          const nextState = givenReducer(prevState, action)
          if (action.type === `${type}_SUCCESS`) {
            return { ...nextState, cool: nextState.data + ' is cool' }
          }
          return nextState
        }
      },
    })()
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_SUCCESS`, payload: { data: 'Maik' } })
    ).toEqual({
      loading: false,
      data: 'Maik',
      cool: 'Maik is cool',
      error: null,
    })
  })

  it('should accept the old proxyReducer config key but print a warn', () => {
    spyWarn.mockReset()
    const { reducer } = rj({
      type,
      state,
      proxyReducer: givenReducer => {
        return (prevState, action) => {
          const nextState = givenReducer(prevState, action)
          if (action.type === `${type}_SUCCESS`) {
            return { ...nextState, cool: nextState.data + ' is cool' }
          }
          return nextState
        }
      },
    })()
    const prevState = {
      loading: true,
      data: null,
      error: null,
    }
    expect(
      reducer(prevState, { type: `${type}_SUCCESS`, payload: { data: 'Maik' } })
    ).toEqual({
      loading: false,
      data: 'Maik',
      cool: 'Maik is cool',
      error: null,
    })
    expect(spyWarn).toHaveBeenCalled()
  })

  it('should be composable', () => {
    const rA = rj({
      composeReducer: [
        (prevState, action) => ({ ...prevState, giova: 12 }),
        (prevState, action) => ({ ...prevState, rinne: 1 }),
      ],
    })

    const rA1 = rj(rA, {
      composeReducer: [
        (prevState, action) =>
          action.type === 'YEAH'
            ? {
                ...prevState,
                giova: prevState.giova * 2,
              }
            : prevState,
      ],
    })

    const { reducer } = rj(rA1, {
      type: 'OH',
      state: 'nevada',
      composeReducer: [
        (prevState, action) =>
          action.type === 'YEAH'
            ? {
                ...prevState,
                giova: `Gio Va Age: ${prevState.giova}`,
              }
            : prevState,
      ],
    })()

    let state = reducer(undefined, {})
    expect(state).toEqual({
      loading: false,
      error: null,
      data: null,
      rinne: 1,
      giova: 12,
    })
    state = reducer(state, { type: 'YEAH' })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: null,
      rinne: 1,
      giova: 'Gio Va Age: 24',
    })
  })

  it('should clear reducer state using unloadBy', () => {
    const { reducer } = rj(
      rj({
        unloadBy: 'LOGOUT',
      }),
      rj({
        composeReducer: [(prevState = { pippo: 23 }) => prevState],
      }),
      rj({
        composeReducer: [(prevState = { socio: 23 }) => prevState],
      }),
      rj({
        unloadBy: 'KLOOSE',
      }),
      {
        type: 'BELLA',
        state: 'bella',
        composeReducer: [(prevState = { giova: 23 }) => prevState],
        unloadBy: 'STAKKA',
        // FIXME: This is need but is wrong....
        api: () => 23,
      }
    )()

    const prevState = {
      loading: false,
      error: null,
      data: ['Un', 'Dos', 'Tres'],
      pippo: 'Pippo Tek',
      socio: null,
      giova: 69,
    }
    const guestInitalState = {
      loading: false,
      error: null,
      data: null,
      pippo: 23,
      socio: 23,
      giova: 23,
    }
    expect(reducer(prevState, { type: 'LOGOUT' })).toEqual(guestInitalState)
    expect(reducer(prevState, { type: 'KLOOSE' })).toEqual(guestInitalState)
    expect(reducer(prevState, { type: 'STAKKA' })).toEqual(guestInitalState)
  })

  it('should ignore unloadBy for reducer when state is to false', () => {
    const { reducer } = rj(
      rj({
        unloadBy: 'LOGOUT',
      }),
      rj({
        unloadBy: 'KLOOSE',
      }),
      {
        type: 'BELLA',
        state: false,
        unloadBy: 'STAKKA',
        // FIXME: This is need but is wrong....
        api: () => 23,
      }
    )()

    expect(reducer).toBeUndefined()
  })
})
