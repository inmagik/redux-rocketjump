import { rj } from '../..'

const TYPE = 'RJ_LIST_UPDATE'

const defaultIdentity = (action, listItem) => action.item.id === listItem.id
const defaultUpdater = (action, listItem) => action.item

const rjListUpdate = (config = {}) => {
  const identity = config.identity || defaultIdentity
  const updater = config.updater || defaultUpdater

  return rj({
    actions: () => ({
      updateItem: item => ({ type: TYPE, item })
    }),
    reducer: oldReducer => (state, action) => {
      if (action.type === TYPE) {
        return {
          ...state,
          data: {
            ...state.data,
            list: state.data.list.map(listItem => identity(action, listItem) ? updater(action, listItem) : listItem )
          }
        }
      }
      return oldReducer(state, action)
    }
  })
}

export default rjListUpdate