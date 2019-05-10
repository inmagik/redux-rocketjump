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

  const getPageSize =
    typeof pageSizeSelector === 'function'
      ? pageSizeSelector
      : () => pageSizeSelector

  const getList = state => {
    const data = getData(state)
    return data === null ? null : data.list
  }

  const getCount = state => {
    const data = getData(state)
    return data === null ? null : data.pagination.count
  }

  const getNumPages = state => {
    const count = getCount(state)
    const getPageSize = getPageSize(state)
    return count === null ? null : Math.ceil(count / pageSize)
  }
  
  const hasNext = state => {
    const data = getData(state)
    return data === null ? false : data.pagination.next !== null
  }

  const hasPrev = state => {
    const data = getData(state)
    return data === null ? false : data.pagination.previous !== null
  }

  const getNext = state => {
    const data = getData(state)
    return data === null ? null : data.pagination.next
  }

  const getPrev = state => {
    const data = getData(state)
    return data === null ? null : data.pagination.previous
  }

  const getCurrent = state => {
    const data = getData(state)
    return data === null ? null : data.pagination.current
  }

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
