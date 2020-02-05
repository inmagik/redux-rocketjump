import { call, select } from 'redux-saga/effects'
import { rj } from '../../rocketjump'
import { createMockStoreWithSaga } from '../../testUtils'

const MUTATION_PREFIX = '@MUTATION'
const RJ_PREFIX = '@RJ'

describe('RJ mutations saga', () => {
  it('should be use take effect every by default', async () => {
    const resolvesA = []
    const mockEffectA = jest.fn(() => new Promise(r => resolvesA.push(r)))
    const resolvesB = []
    const mockEffectB = jest.fn(() => new Promise(r => resolvesB.push(r)))

    const RjObject = rj({
      mutations: {
        mutationA: {
          effect: mockEffectA,
          updater: () => {},
        },
        mutationB: {
          effect: mockEffectB,
          updater: () => {},
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => {},
    })()
    const { actions } = RjObject

    const store = createMockStoreWithSaga(RjObject.saga)
    store.dispatch(actions.mutationA())
    store.dispatch(actions.mutationA(['4LB1']))

    const typePrefix = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}`

    expect(mockEffectA).toHaveBeenCalledTimes(2)
    expect(mockEffectB).toHaveBeenCalledTimes(0)
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationA`,
        meta: { params: [] },
        payload: { params: [] },
      },
      {
        type: `${typePrefix}/mutationA/LOADING`,
        meta: { params: [] },
      },
      {
        type: `${typePrefix}/mutationA`,
        meta: { params: ['4LB1'] },
        payload: { params: ['4LB1'] },
      },
      {
        type: `${typePrefix}/mutationA/LOADING`,
        meta: { params: ['4LB1'] },
      },
    ])
    store.clearActions()
    store.dispatch(actions.mutationB())
    expect(mockEffectA).toHaveBeenCalledTimes(2)
    expect(mockEffectB).toHaveBeenCalledTimes(1)
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationB`,
        meta: { params: [] },
        payload: { params: [] },
      },
      {
        type: `${typePrefix}/mutationB/LOADING`,
        meta: { params: [] },
      },
    ])
    store.clearActions()
    resolvesA[0]('Fumello')
    await mockEffectA.mock.results[0].value
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationA/SUCCESS`,
        meta: {
          params: [],
        },
        payload: {
          data: 'Fumello',
          params: [],
        },
      },
    ])
    store.clearActions()
    resolvesB[0](1312)
    await mockEffectB.mock.results[0].value
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationB/SUCCESS`,
        meta: {
          params: [],
        },
        payload: {
          data: 1312,
          params: [],
        },
      },
    ])
    store.clearActions()
    resolvesA[1](23)
    await mockEffectA.mock.results[1].value
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationA/SUCCESS`,
        meta: {
          params: ['4LB1'],
        },
        payload: {
          data: 23,
          params: ['4LB1'],
        },
      },
    ])
  })

  it('should be use a custom take effect when specified', async () => {
    const resolvesA = []
    const mockEffectA = jest.fn(() => new Promise(r => resolvesA.push(r)))
    const resolvesB = []
    const mockEffectB = jest.fn(() => new Promise(r => resolvesB.push(r)))

    const RjObject = rj({
      mutations: {
        mutationA: {
          effect: mockEffectA,
          takeEffect: 'exhaust',
          updater: () => {},
        },
        mutationB: {
          effect: mockEffectB,
          updater: () => {},
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => {},
    })()

    const { actions } = RjObject
    const store = createMockStoreWithSaga(RjObject.saga)
    const typePrefix = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}`

    store.dispatch(actions.mutationA())
    store.dispatch(actions.mutationA(['4LB1']))
    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectB).toHaveBeenCalledTimes(0)
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationA`,
        meta: { params: [] },
        payload: { params: [] },
      },
      {
        type: `${typePrefix}/mutationA/LOADING`,
        meta: { params: [] },
      },
      {
        type: `${typePrefix}/mutationA`,
        meta: { params: ['4LB1'] },
        payload: { params: ['4LB1'] },
      },
    ])
    store.clearActions()
    store.dispatch(actions.mutationB())
    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectB).toHaveBeenCalledTimes(1)
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationB`,
        meta: { params: [] },
        payload: { params: [] },
      },
      {
        type: `${typePrefix}/mutationB/LOADING`,
        meta: { params: [] },
      },
    ])
    store.clearActions()
    resolvesA[0]('Fumello')
    await mockEffectA.mock.results[0].value
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationA/SUCCESS`,
        meta: { params: [] },
        payload: { params: [], data: 'Fumello' },
      },
    ])
    store.clearActions()
    resolvesB[0](1312)
    await mockEffectB.mock.results[0].value
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/mutationB/SUCCESS`,
        meta: { params: [] },
        payload: { params: [], data: 1312 },
      },
    ])
  })

  it('should apply the mutation effect caller', async () => {
    const mockApi = jest.fn().mockResolvedValue(['GioVa'])

    const callerA = jest.fn(function*(fn, ...args) {
      const data = yield call(fn, ...args)
      return data.concat('Skaffo')
    })

    const callerB = jest.fn(function*(fn, ...args) {
      // eslint-disable-next-line no-unused-vars
      const data = yield call(fn, ...args)
      return 'BaBuMon'
    })

    const RjObject = rj({
      mutations: {
        killHumans: {
          effect: mockApi,
          updater: () => {},
          effectCaller: callerA,
        },
      },
      effectCaller: callerA,
      state: 'babu',
      type: 'BABU',
      effect: () => {},
    })()

    const { actions } = RjObject
    const store = createMockStoreWithSaga(RjObject.saga)
    store.dispatch(actions.killHumans())

    expect(callerA).toHaveBeenCalled()
    expect(callerB).not.toHaveBeenCalled()
    await callerA.mock.results[0].value
    const typePrefix = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}`
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/killHumans`,
        meta: { params: [] },
        payload: { params: [] },
      },
      {
        type: `${typePrefix}/killHumans/LOADING`,
        meta: { params: [] },
      },
      {
        type: `${typePrefix}/killHumans/SUCCESS`,
        payload: {
          params: [],
          data: ['GioVa', 'Skaffo'],
        },
        meta: { params: [] },
      },
    ])
  })

  it('should apply the parent effect caller if not specified', async () => {
    const mockApi = jest.fn().mockResolvedValue(['GioVa'])

    const callerA = jest.fn(function*(fn, ...args) {
      const data = yield call(fn, ...args)
      return data.concat('Skaffo')
    })

    const RjObject = rj({
      mutations: {
        killHumans: {
          effect: mockApi,
          updater: () => {},
        },
      },
      effectCaller: callerA,
      state: 'babu',
      type: 'BABU',
      effect: () => {},
    })()

    const { actions } = RjObject
    const store = createMockStoreWithSaga(RjObject.saga)
    store.dispatch(actions.killHumans())

    expect(callerA).toHaveBeenCalled()
    await callerA.mock.results[0].value
    const typePrefix = `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}`
    expect(store.getActions()).toEqual([
      {
        type: `${typePrefix}/killHumans`,
        meta: { params: [] },
        payload: { params: [] },
      },
      {
        type: `${typePrefix}/killHumans/LOADING`,
        meta: { params: [] },
      },
      {
        type: `${typePrefix}/killHumans/SUCCESS`,
        payload: {
          params: [],
          data: ['GioVa', 'Skaffo'],
        },
        meta: { params: [] },
      },
    ])
  })

  it('should use effect extra params to provide extra params to mutation effect', async () => {
    const mockEffectA = jest.fn().mockResolvedValue(23)

    const RjObject = rj({
      mutations: {
        mutationA: {
          effect: mockEffectA,
          effectExtraParams: function* extraShit() {
            const g = yield select(state => state.giova)
            return [g]
          },
          updater: () => {},
        },
      },
      state: 'babu',
      type: 'BABU',
      effect: () => {},
    })()
    const { actions } = RjObject

    const store = createMockStoreWithSaga(RjObject.saga, {
      giova: 2323,
    })
    store.dispatch(actions.mutationA())
    expect(mockEffectA).toHaveBeenCalledTimes(1)
    expect(mockEffectA).nthCalledWith(1, 2323)
  })
})
