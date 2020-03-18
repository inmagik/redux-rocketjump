// Mutations library helpers
import { makeMutationActionTypes as makeMutationActionTypesInternal } from './actions'

// Remove internal last option
export const makeMutationActionTypes = (type, mutationName) =>
  makeMutationActionTypesInternal(type, mutationName, undefined)
