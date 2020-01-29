import { makeMutationActionTypes } from '../helpers'

const MUTATION_PREFIX = '@MUTATION'
const RJ_PREFIX = '@RJ'

describe('RJ mutations helpers', () => {
  it('should give an helper to create mutation action types', async () => {
    expect(makeMutationActionTypes('BABU', 'update')).toEqual({
      main: `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/update`,
      loading: `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/update/LOADING`,
      success: `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/update/SUCCESS`,
      failure: `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/update/FAILURE`,
      unload: `${RJ_PREFIX}/BABU/${MUTATION_PREFIX}/update/UNLOAD`,
    })
  })
})
