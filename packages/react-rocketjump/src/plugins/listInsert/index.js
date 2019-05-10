import { rj } from '../..'

const TYPE = 'RJ_LIST_INSERT'

const defaultMerge = (action, list) => list.concat([action.item])

const rjListInsert = (config = {}) => {

  return rj({
    actions: () => ({
      insertItem: item => ({ type: TYPE, item })
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
        const mergeFunc = config.merge ? config.merge : defaultMerge
        return {
          ...state,
          data: {
            ...state.data,
            list: mergeFunc(action, state.data.list)
          }
        }
      }
      return oldReducer(state, action)
    }
  })
}

export default rjListInsert