import { rj } from '../../rocketjump'

const MUTATION_PREFIX = '@MUTATION'
const RJ_PREFIX = '@RJ'

describe('RJ mutations reducers', () => {
  it('should be generated only when reducer key is present', async () => {
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => {},
          updater: () => {},
        },
        fuckSnitch: {
          effect: () => {},
          updater: () => {},
        },
      },
      type: 'BABU',
      state: 'babu',
      effect: () => {},
    })()

    let state = MaRjState.reducer(undefined, { type: '__XxIniXIT__' })
    expect(state).toEqual({
      loading: false,
      error: null,
      data: null,
    })
  })
  it('should be match the mutation key and be decoupled to related mutation', async () => {
    const mockReducer = jest.fn(() => ({
      giova: 23,
    }))
    const MaRjState = rj({
      mutations: {
        killHumans: {
          effect: () => {},
          updater: state => state,
          reducer: mockReducer,
        },
        fuckSnitch: {
          effect: () => {},
          updater: () => {},
        },
      },
      type: 'BABU',
      state: 'babu',
      effect: () => {},
    })()

    const { reducer } = MaRjState
    // fuck off redux combineReducers
    mockReducer.mockClear()
    let state = reducer(undefined, { type: 'X..InIT' })
    expect(mockReducer).toHaveBeenCalledTimes(1)
    expect(mockReducer).toHaveBeenNthCalledWith(1, undefined, {
      type: 'X..InIT',
    })
    expect(state.mutations).toEqual({
      killHumans: { giova: 23 },
    })
    state = reducer(state, { type: 'KUAKAMOLE' })
    state = reducer(state, { type: 'SUCCESS', payload: {} })
    state = reducer(state, { type: 'PENDING ' })
    state = reducer(state, { type: 'FAILURE ' })
    state = reducer(state, {
      type: `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/OoO/SUCCESS`,
    })
    expect(mockReducer).toHaveBeenCalledTimes(1)
    state = reducer(state, {
      type: `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/killHumans/SUCCESS`,
      payload: { data: 23 },
      meta: { params: ['GioVa'] },
    })
    expect(mockReducer).toHaveBeenCalledTimes(2)
    expect(mockReducer).toHaveBeenNthCalledWith(
      2,
      { giova: 23 },
      {
        type: 'SUCCESS',
        payload: { data: 23 },
        meta: { params: ['GioVa'] },
      }
    )
  })
})
