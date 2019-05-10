import { rj } from '../../index'
import { set, get } from '../../helpers'

const TYPE = 'RJ_LIST_DELETE'

const defaultIdentity = (action, listItem) => action.item.id === listItem.id

const rjListDelete = (config = {}) => {
  const identity = config.identity || defaultIdentity
  const path = config.path || 'data'

  return rj({
    actions: () => ({
      deleteItem: item => ({ type: TYPE, item })
    }),
    reducer: oldReducer => (state, action) => {
      if (action.type === TYPE) {
        if (state.data.pagination && config.warnPagination !== false) {
          // eslint-disable-next-line no-console
          console.warn(
            'It seems you are using this plugin on a paginated list. Remember that this plugin is agnostic wrt pagination, and will break it. To suppress this warning, set warnPagination: false in the config object'
          )
        }
        const newState = {...state}
        set(newState, path, get(newState, path).filter(listItem => !identity(action, listItem)))
        return newState
      }
      return oldReducer(state, action)
    }
  })
}

export default rjListDelete