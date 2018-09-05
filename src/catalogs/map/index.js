import omit from 'lodash.omit'
import { createSelector } from 'reselect'
import { rj } from '../../rocketjump'
import { makeActionTypes } from '../../actions'
import { takeLatestAndCancelGroupBy } from '../../effects'
import { makeReducer } from '../../reducer'

const defaultKeyMaker = action => action.meta ? action.meta.id : null
export const makeMapReducer = (
  mainType,
  keyMaker = defaultKeyMaker,
  dataReducer,
  keepSucceded = true,
) => {
  const actionTypes = makeActionTypes(mainType)
  const itemReducer = makeReducer(mainType, dataReducer)

  return (prevState = {}, action) => {
    switch (action.type) {
      case actionTypes.loading:
      case actionTypes.failure:
      {
        const key = keyMaker(action)
        return {
          ...prevState,
          [key]: itemReducer(prevState[key], action)
        }
      }
      case actionTypes.success: {
        const key = keyMaker(action)
        if (keepSucceded) {
          return {
            ...prevState,
            [key]: itemReducer(prevState[key], action)
          }
        } else {
          return omit(prevState, key)
        }
      }
      case actionTypes.unload: {
        const key = keyMaker(action)
        // Clear key state
        if (key) {
          return omit(prevState, key)
        }
        // Clear all the state
        return {}
      }
      default:
        return prevState
    }
  }
}

export const makeMapSelectors = (getBaseState) => {

  const getMapLoadings = createSelector(
    getBaseState,
    state => Object.keys(state)
      .reduce((r, key) => state[key].loading ? { ...r, [key]: true } : r, {})
  )

  const getMapFailures = createSelector(
    getBaseState,
    state => Object.keys(state)
      .reduce((r, key) => {
        const error = state[key].error
        return error !== null ? { ...r, [key]: error } : r
      }, {})
  )

  const getMapData = createSelector(
    getBaseState,
    state => Object.keys(state)
      .reduce((r, key) => {
        const data = state[key].data
        return data !== null ? { ...r, [key]: data } : r
      }, {})
  )

  return {
    getMapLoadings,
    getMapFailures,
    getMapData,
  }
}

export default (mapConfig = {}) => (config, ...args) => rj({
  proxyActions: {
    loadKey: ({ load }) => (id, params = {}, meta = {}) =>
      load({ id, ...params }, { id, ...meta }),
    unloadKey: ({ unload }) => id => unload({ id }),
  },
  // SWAP reducer \w new map reducer
  proxyReducer: () => makeMapReducer(
    config.type,
    mapConfig.key,
    mapConfig.dataReducer,
    mapConfig.keepSucceded,
  ),
  proxySelectors: ({ getBaseState }) => makeMapSelectors(getBaseState),
  takeEffect: takeLatestAndCancelGroupBy,
  takeEffectArgs: [
    typeof mapConfig.key === 'function'
      ? mapConfig.key
      : defaultKeyMaker
  ],
})(config, ...args)
