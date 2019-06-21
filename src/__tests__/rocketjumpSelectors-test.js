import { rj } from '../rocketjump'
import { createSelector } from 'reselect'
import { orderBy } from 'lodash'

const spyWarn = jest.spyOn(global.console, 'warn')

describe('Rocketjump selectors', () => {
  const type = 'GET_SOCI'
  const state = 'soci'
  const fakeState = {
    soci: {
      loading: false,
      error: 'Too much fresh',
      data: [
        {
          name: 'Giova',
          age: 24,
        },
        {
          name: 'Maik',
          age: 29,
        },
      ],
    },
  }

  it('should be getData, isLoading, getError, getBaseState', () => {
    const { selectors } = rj({
      type,
      state,
    })()
    expect(selectors.getBaseState(fakeState)).toBe(fakeState.soci)
    expect(selectors.isLoading(fakeState)).toBe(fakeState.soci.loading)
    expect(selectors.getError(fakeState)).toBe(fakeState.soci.error)
    expect(selectors.getData(fakeState)).toBe(fakeState.soci.data)
  })

  it('should be proxable and extendible', () => {
    const { selectors } = rj({
      type,
      state,
      selectors: {
        getData: ({ getData }) =>
          createSelector(
            getData,
            soci =>
              soci.map(s => ({
                ...s,
                name: s.name.toUpperCase(),
                fresh: true,
              }))
          ),
        getOldest: ({ getData }) =>
          createSelector(
            getData,
            soci => {
              return orderBy(soci, 'age', 'desc')[0]
            }
          ),
      },
    })()

    expect(selectors.getData(fakeState)).toEqual([
      {
        name: 'GIOVA',
        fresh: true,
        age: 24,
      },
      {
        name: 'MAIK',
        fresh: true,
        age: 29,
      },
    ])
    expect(selectors.getOldest(fakeState)).toEqual({
      name: 'Maik',
      age: 29,
    })
  })

  it('should still allow using proxySelectors but print warning', () => {
    spyWarn.mockReset()
    const { selectors } = rj({
      type,
      state,
      proxySelectors: {
        getData: ({ getData }) =>
          createSelector(
            getData,
            soci =>
              soci.map(s => ({
                ...s,
                name: s.name.toUpperCase(),
                fresh: true,
              }))
          ),
        getOldest: ({ getData }) =>
          createSelector(
            getData,
            soci => {
              return orderBy(soci, 'age', 'desc')[0]
            }
          ),
      },
    })()

    expect(selectors.getData(fakeState)).toEqual([
      {
        name: 'GIOVA',
        fresh: true,
        age: 24,
      },
      {
        name: 'MAIK',
        fresh: true,
        age: 29,
      },
    ])
    expect(selectors.getOldest(fakeState)).toEqual({
      name: 'Maik',
      age: 29,
    })
    expect(spyWarn).toHaveBeenCalled()
  })

  it('should be composable', () => {
    const rjIsAlive = rj({
      selectors: {
        getData: ({ getData }) =>
          createSelector(
            getData,
            soci =>
              soci.map(s => ({
                ...s,
                isAlive: s.age < 27,
              }))
          ),
      },
    })
    const capitalize = s =>
      s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()
    const rjRangerName = rj({
      selectors: {
        getData: ({ getData }) =>
          createSelector(
            getData,
            soci =>
              soci.map(s => ({
                ...s,
                rangerName: [s.name.slice(0, -2), s.name.slice(-2)]
                  .map(capitalize)
                  .join(' '),
              }))
          ),
      },
    })
    const { selectors } = rj(rjIsAlive, rjRangerName, {
      type,
      state,
      selectors: {
        getData: ({ getData }) =>
          createSelector(
            getData,
            soci =>
              soci.map(s => ({
                ...s,
                hello: `My name is ${s.rangerName} an i am ${s.age}`,
              }))
          ),
      },
    })({
      selectors: {
        getData: ({ getData }) =>
          createSelector(
            getData,
            soci =>
              soci.map(s => ({
                ...s,
                hello: s.isAlive
                  ? `${s.hello} and i am alive`
                  : `${s.hello} and i am a ghost`,
              }))
          ),
      },
    })

    expect(selectors.getData(fakeState)).toEqual([
      {
        name: 'Giova',
        age: 24,
        isAlive: true,
        rangerName: 'Gio Va',
        hello: 'My name is Gio Va an i am 24 and i am alive',
      },
      {
        name: 'Maik',
        age: 29,
        isAlive: false,
        rangerName: 'Ma Ik',
        hello: 'My name is Ma Ik an i am 29 and i am a ghost',
      },
    ])
  })
})
