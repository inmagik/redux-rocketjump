import { createSelector } from 'reselect'
import omit from 'lodash.omit'
import { rocketjump, makeActionTypes, makeActions } from './core'
import { takeEveryAndCancel } from './effects'
import { getOrSelect } from './utils'

export const makeDeleteActions = (type) => {
  const { load, unload } = makeActions(type)

  const perform = (id, params = {}, meta = {}) =>
    load({ ...params, id  }, { ...meta, id })

  return {
    perform,
    unload,
  }
}

export const makeDeleteSelectors = stateSelector => {

  const baseState = state => getOrSelect(state, stateSelector)

  const getDeleted = createSelector(
    baseState,
    ({ deleted }) => deleted
  )

  const getDeleting = createSelector(
    baseState,
    ({ deleting }) => deleting
  )

  const getFailures = createSelector(
    baseState,
    ({ failures }) => failures
  )

  return {getDeleted, getDeleting, getFailures}
}

export const makeDeleteReducer = (type) => {
  const actionTypes = makeActionTypes(type)

  const defaultState = { deleting: {}, failures: {}, deleted: {} }

  return (prevState = defaultState, { type, payload, meta, error }) => {
    switch (type) {
      case actionTypes.loading:
        return {
          ...prevState,
          deleting: {
            ...prevState.deleting,
            [meta.id]: true,
          },
          failures: omit(prevState.failures, meta.id),
        }
      case actionTypes.failure:
        return {
          ...prevState,
          deleting: omit(prevState.deleting, meta.id),
          failures: {
            ...prevState.failures,
            [meta.id]: error,
          }
        }
      case actionTypes.success:
        return {
          ...prevState,
          deleting: omit(prevState.deleting, meta.id),
          deleted: {
            ...prevState.deleted,
            [meta.id]: true,
          }
        }
      case actionTypes.unload:
        return { ...prevState, ...defaultState }
      default:
        return prevState
    }
  }
}

export const makeDelete = (config) => rocketjump({
  proxyActions: {
    load: ({ load }) => (id, params = {}, meta = {}) =>
      load({ ...params, id  }, { ...meta, id })
  },
  proxyReducer: () => makeDeleteReducer(config.type),
  proxySelectors: () => makeDeleteSelectors(config.state),
  takeEffect: takeEveryAndCancel,
})(config)
