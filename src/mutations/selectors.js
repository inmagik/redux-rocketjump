import get from 'lodash.get'
import { makeSelectors } from '../selectors'
import { getOrSelect } from '../helpers'
import { hasMutationsConfigSomeState } from './utils'

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
    const getMutation = (state, mutationName, path = '') =>
      get(getOrSelect(state, stateSelector).mutations, `${mutationName}${path}`)
    return {
      ...baseSelectors,
      getParentBaseState,
      getMutationsState,
      getMutation,
    }
  } else {
    return makeSelectors(stateSelector)
  }
}
