import { makeActionTypes } from '../actions'
import { arrayze } from 'rocketjump-core/utils'

// At least one mutation config has a reducer that create a state
export function hasMutationsConfigSomeState(mutations) {
  return Object.keys(mutations).some(
    name => typeof mutations[name].reducer === 'function'
  )
}

export function mergeUnloadBy(parentType, parentUnloadBy, mutationUnloadBy) {
  // Unload by main unload type of parent rj
  let unloadBy = [makeActionTypes(parentType).unload]

  // If parent rj has unloadBy add them
  if (parentUnloadBy) {
    unloadBy = arrayze(parentUnloadBy).concat(unloadBy)
  }

  // Add specific mutation unloadBy
  if (mutationUnloadBy) {
    unloadBy = unloadBy.concat(arrayze(mutationUnloadBy))
  }

  return unloadBy
}
