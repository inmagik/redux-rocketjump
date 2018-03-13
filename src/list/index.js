import get from 'lodash.get'
import { createSelector } from 'reselect'
import { rocketjump, makeActionTypes, makeReducer } from '../core'
import { getOrSelect, composeReducers } from '../utils'
import {
  limitOffsetPaginationAdapter,
  nextPreviousPaginationAdapter,
} from './pagination'

export const makeDeleteListReducerById = (type, getId = ({ meta }) => meta.id) =>
  (prevState, action) => {
    if (action.type === type && prevState.data) {
      return {
        ...prevState,
        data: {
          ...prevState.data,
          pagination: {
            ...prevState.data.pagination,
            count: prevState.data.pagination.count - 1,
          },
          list: prevState.data.list.filter(({ id }) => id !== getId(action)),
        }
      }
    } else {
      return prevState
    }
  }

// Paginate list create data handle info about the list it self
// total items and finally the next and prev params to call
// side effect \w to go prev next
export const makeListReducer = (type, c = {}) => {
  let reducer = makeReducer(type, makeListDataReducer(c))
  if (c.deleteBy) {
    reducer = composeReducers(
      reducer,
      makeDeleteListReducerById(makeActionTypes(c.deleteBy).success)
    )
  }
  return reducer
}

export const makeListDataReducer = (c = {}) => {
  // Configure the pagination!
  const config = {
    // Standar pagination adapter!
    paginationAdapter: nextPreviousPaginationAdapter,
     ...c,
  }

  const defaultListReducer = (prevState, { payload: { data } }) =>
    getOrSelect(data, config.paginationAdapter.list)

  const defaultPaginationReducer = (prevState, { payload: { data, params } }) => ({
    count: getOrSelect(data, config.paginationAdapter.count),
    current: getOrSelect(params, config.paginationAdapter.current),
    next: getOrSelect(data, config.paginationAdapter.next),
    previous: getOrSelect(data, config.paginationAdapter.previous),
  })

  const listReducer = typeof config.listReducer === 'function'
    ? config.listReducer
    : defaultListReducer

  const paginationReducer = typeof config.paginationReducer === 'function'
    ? config.paginationReducer
    : defaultPaginationReducer

  return (prevState, action) => ({
    list: listReducer(get(prevState, 'list'), action),
    pagination: paginationReducer(get(prevState, 'pagination'), action),
  })
}

const makeDataListSelectors = (getData, pageSizeSelector) => {

  const getPageSize = typeof pageSizeSelector === 'function'
    ? pageSizeSelector
    : () => pageSizeSelector

  const getList = createSelector(
    getData,
    data => data === null ? null : data.list
  )

  const getCount = createSelector(
    getData,
    data => data === null ? null : data.pagination.count
  )

  const getNumPages = createSelector(
    getCount,
    getPageSize,
    (count, pageSize) => count === null ? null : Math.ceil(count / pageSize)
  )

  const hasNext = createSelector(
    getData,
    data => data === null ? false : data.pagination.next !== null
  )

  const hasPrev = createSelector(
    getData,
    data => data === null ? false : data.pagination.prev !== null
  )

  return {
    getList,
    getCount,
    getNumPages,
    hasNext,
    hasPrev,
  }
}

// Paginate list rocketjump!
export const makeList = config => rocketjump({
  dataReducer: makeListDataReducer(config),
  proxyReducer: reducer => {
    if (config.deleteBy) {
      reducer = composeReducers(
        reducer,
        makeDeleteListReducerById(makeActionTypes(config.deleteBy).success),
      )
    }
    return reducer
  },
  proxySelectors: ({ getData }) => {
    return makeDataListSelectors(getData, config.pageSize)
  },
})(config)

export { limitOffsetPaginationAdapter, nextPreviousPaginationAdapter }
