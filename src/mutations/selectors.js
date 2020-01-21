import { makeSelectors } from '../selectors'
import { getOrSelect } from '../helpers'
import { hasMutationsConfigSomeState } from './helpers'

export function makeSelectorsWithMutations(stateSelector, mutations) {
  if (hasMutationsConfigSomeState(mutations)) {
    let namespacedStateSelector
    if (typeof stateSelector === 'function') {
      namespacedStateSelector = state => stateSelector(state).root
    } else {
      namespacedStateSelector = `${stateSelector}.root`
    }
    const baseSelectors = makeSelectors(namespacedStateSelector)
    const getParentBaseState = state => getOrSelect(state, stateSelector)
    const getMutationsState = state =>
      getOrSelect(state, stateSelector).mutations
    return {
      ...baseSelectors,
      getParentBaseState,
      getMutationsState,
    }
  } else {
    return makeSelectors(stateSelector)
  }
}
