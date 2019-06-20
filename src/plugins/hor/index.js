// Higher Order Reducers
import get from 'lodash.get'
import { set } from 'object-path-immutable'
import { makeActionTypes } from '../../actions'
import { arrayze, matchActionPattern } from 'rocketjump-core/utils'

const defaultIdentity = (action, object) => action.meta.id === object.id
const defaultUpdater = (action, object) => action.payload.data

const makePattern = type =>
  arrayze(type).map(type => makeActionTypes(type).success)

// HOR For generic data update
export const makeUpdateReducer = (
  type,
  path = 'data',
  identity = defaultIdentity,
  updater = defaultUpdater
) => {
  const pattern = makePattern(type)

  return (prevState, action) => {
    const oldData = get(prevState, path)

    if (matchActionPattern(action, pattern) && oldData) {
      let newData
      if (Array.isArray(oldData)) {
        // Update as list
        newData = oldData.map(item =>
          !identity(action, item) ? item : updater(action, item)
        )
      } else {
        newData = identity(action, oldData) ? updater(action, oldData) : oldData
      }

      return set(prevState, path, newData)
    }

    return prevState
  }
}

// HOR for remove item from list
export const makeRemoveListReducer = (
  type,
  listPath = 'data.list',
  paginationPath = 'data.pagination',
  identity = defaultIdentity
) => {
  const pattern = makePattern(type)

  return (prevState, action) => {
    const oldList = get(prevState, listPath)

    if (matchActionPattern(action, pattern) && oldList) {
      let nextState

      const newList = oldList.filter(item => !identity(action, item))
      nextState = set(prevState, listPath, newList)

      if (paginationPath) {
        const oldPagination = get(prevState, paginationPath)
        const newPagination = {
          ...oldPagination,
          count: oldPagination.count - 1,
        }
        nextState = set(nextState, paginationPath, newPagination)
      }

      return nextState
    }

    return prevState
  }
}

const defaultAddToList = (list, action) => list.concat(action.payload.data)

// HOR for add item to list
export const makeAddListReducer = (
  type,
  listPath = 'data.list',
  paginationPath = 'data.pagination',
  addToList = defaultAddToList
) => {
  const pattern = makePattern(type)

  return (prevState, action) => {
    const oldList = get(prevState, listPath)

    if (matchActionPattern(action, pattern) && oldList) {
      let nextState

      const newList = addToList(oldList, action)
      nextState = set(prevState, listPath, newList)

      if (paginationPath) {
        const oldPagination = get(prevState, paginationPath)
        const newPagination = {
          ...oldPagination,
          count: oldPagination.count + 1,
        }
        nextState = set(nextState, paginationPath, newPagination)
      }

      return nextState
    }

    return prevState
  }
}
