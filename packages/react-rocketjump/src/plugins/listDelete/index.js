import { rj } from '../..'

const TYPE = 'RJ_LIST_DELETE'

const defaultIdentity = (action, listItem) => action.item.id === listItem.id

const rjListDelete = (config = {}) => {
  const identity = config.identity || defaultIdentity

  return rj({
    actions: () => ({
      deleteItem: item => ({ type: TYPE, item })
    }),
    reducer: oldReducer => (state, action) => {
      if (action.type === TYPE) {
        if (state.data.pagination && config.warnPagination !== false) {
          console.warn(
            'It seems you are using this plugin on a paginated list. \
            Remember that this plugin is agnostic wrt pagination, and will break it. \
            To suppress this warning, set warnPagination: false in the config object'
          )
        }
        return {
          ...state,
          data: {
            ...state.data,
            list: state.data.list.filter(listItem => !identity(action, listItem))
          }
        }
      }
      return oldReducer(state, action)
    }
  })
}

export default rjListDelete