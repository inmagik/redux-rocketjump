import { rj } from '../..'
import { set, get } from '../../helpers'

const TYPE = 'RJ_LIST_UPDATE'

const defaultIdentity = (action, listItem) => action.item.id === listItem.id
const defaultUpdater = (action) => action.item

const rjListUpdate = (config = {}) => {
  const identity = config.identity || defaultIdentity
  const updater = config.updater || defaultUpdater
  const path = config.path || 'data'

  return rj({
    actions: () => ({
      updateItem: item => ({ type: TYPE, item })
    }),
    reducer: oldReducer => (state, action) => {
      if (action.type === TYPE) {
        const newState = { ...state }
        set(newState, path, get(newState, path).map(listItem => identity(action, listItem) ? updater(action, listItem) : listItem))
        return newState
      }
      return oldReducer(state, action)
    }
  })
}

export default rjListUpdate