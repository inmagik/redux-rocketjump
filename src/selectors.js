import { createSelector } from 'reselect'
import { getOrSelect } from './helpers'

// Barebone selectors for barebone reducer
export const makeSelectors = stateSelector => {
  const getBaseState = state => getOrSelect(state, stateSelector)

  const getData = createSelector(
    getBaseState,
    ({ data }) => data
  )
  const isLoading = createSelector(
    getBaseState,
    ({ loading }) => loading
  )
  const getError = createSelector(
    getBaseState,
    ({ error }) => error
  )

  return { getBaseState, getData, isLoading, getError }
}
