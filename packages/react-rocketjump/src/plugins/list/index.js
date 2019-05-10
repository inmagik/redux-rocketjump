import { rj } from '../..'
import { get, getOrSelect } from '../../helpers'
import { SUCCESS } from '../../actionTypes'

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

  const createSelector = (...args) => state => {
    const last = args.pop()
    return last(args.map(arg => arg(state)))
  }

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

  const getNumPages = createSelector(
    getCount,
    getPageSize,
    (count, pageSize) => (count === null ? null : Math.ceil(count / pageSize))
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
const rjList = (config = {}) => {
  if (!config.pagination) throw new Error('[reactRj - rjList] Please define a pagination adapter (config.pagination)');
  if (!config.pageSize) throw new Error('[reactRj - rjList] Please define the page size (config.pageSize)')
  const dataReducer = makeListDataReducer(config.pagination)
  return rj({
    selectors: ({ getData }) => makeListSelectors(getData, config.pageSize),
    reducer: oldReducer => (state, action) => {
      if (action.type === SUCCESS) {
        return {
          ...state,
          pending: false,
          data: dataReducer(state.data, action),
        }
      } else {
        return oldReducer(state, action)
      }
    }
  })
}

export default rjList


export * from './pagination'
