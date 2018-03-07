import { createSelector } from 'reselect'
import { getOrSelect } from '../utils'

// Barebone selectors for barebone reducer
export const makeSelectors = stateSelector => {

  const baseState = state => getOrSelect(state, stateSelector)

  const getData = createSelector(
    baseState,
    ({ data }) => data === null ? null : data
  )

  const isLoading = createSelector(
    baseState,
    ({ loading }) => loading
  )

  const getError = createSelector(
    baseState,
    ({ error }) => error
  )

  return {getData, isLoading, getError}
}
