import { rj } from '../..'
import { get } from '../../helpers'
import { SUCCESS } from '../../actionTypes'

// Data reducer for a list paginated
export const makeListDataReducer = (
  customListReducer
) => {
  const defaultListReducer = (prevState, { payload: { data }, meta }) => {
    const newList = data
    if (meta && meta.append && Array.isArray(prevState)) {
      return prevState.concat(newList)
    }
    if (meta && meta.prepend && Array.isArray(prevState)) {
      return newList.concat(prevState)
    }
    return newList
  }

  const listReducer =
    typeof customListReducer === 'function'
      ? customListReducer
      : defaultListReducer

  return (prevState, action) => ({
    list: listReducer(get(prevState, 'list'), action),
  })
}

// Selectors for a list
export const makeListSelectors = getData => {

  const getList = state => {
    const data = getData(state)
    return data === null ? null : data.list
  }

  const getCount = state => {
    const data = getData(state);
    return data === null ? null : data.pagination.count
  }

  return {
    getList,
    getCount,
  }
}

// RJ List
const rjPlainList = (config = {}) => {
  const dataReducer = makeListDataReducer(config.customListReducer)
  return rj({
    selectors: ({ getData }) => makeListSelectors(getData),
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

export default rjPlainList
