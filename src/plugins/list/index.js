import { createSelector } from 'reselect'
import get from 'lodash.get'
import { rj } from '../../rocketjump'
import { getOrSelect } from '../../helpers'

// Data reducer for a list paginated
export const makeListDataReducer = (
  paginationAdapter,
  customListReducer,
  customPaginationReducer
) => {
  const defaultListReducer = (prevState, { payload: { data }, meta }) => {
    const newList = getOrSelect(data, paginationAdapter.list)
    if (meta && meta.append && Array.isArray(prevState)) {
      return prevState.concat(newList)
    }
    if (meta && meta.prepend && Array.isArray(prevState)) {
      return newList.concat(prevState)
    }
    return newList
  }

  const defaultPaginationReducer = (
    prevState,
    { payload: { data, params } }
  ) => ({
    count: getOrSelect(data, paginationAdapter.count),
    current: getOrSelect(params, paginationAdapter.current),
    next: getOrSelect(data, paginationAdapter.next),
    previous: getOrSelect(data, paginationAdapter.previous),
  })

  const listReducer =
    typeof customListReducer === 'function'
      ? customListReducer
      : defaultListReducer

  const paginationReducer =
    typeof customPaginationReducer === 'function'
      ? customPaginationReducer
      : defaultPaginationReducer

  return (prevState, action) => ({
    list: listReducer(get(prevState, 'list'), action),
    pagination: paginationReducer(get(prevState, 'pagination'), action),
  })
}

// Selectors for a list
export const makeListSelectors = (getData, pageSizeSelector) => {
  const getPageSize =
    typeof pageSizeSelector === 'function'
      ? pageSizeSelector
      : () => pageSizeSelector

  const getList = createSelector(
    getData,
    data => (data === null ? null : data.list)
  )

  const getCount = createSelector(
    getData,
    data => (data === null ? null : data.pagination.count)
  )

  const getNumPages = createSelector(
    getCount,
    getPageSize,
    (count, pageSize) => (count === null ? null : Math.ceil(count / pageSize))
  )

  const hasNext = createSelector(
    getData,
    data => (data === null ? false : data.pagination.next !== null)
  )

  const hasPrev = createSelector(
    getData,
    data => (data === null ? false : data.pagination.previous !== null)
  )

  const getNext = createSelector(
    getData,
    data => (data === null ? null : data.pagination.next)
  )

  const getPrev = createSelector(
    getData,
    data => (data === null ? null : data.pagination.previous)
  )

  const getCurrent = createSelector(
    getData,
    data => (data === null ? null : data.pagination.current)
  )

  return {
    getList,
    getCount,
    getNumPages,
    hasNext,
    hasPrev,
    getNext,
    getPrev,
    getCurrent,
  }
}

// RJ List
export default (config = {}) =>
  rj({
    dataReducer: makeListDataReducer(config.pagination),
    proxySelectors: ({ getData }) =>
      makeListSelectors(getData, config.pageSize),
  })

export * from './pagination'
