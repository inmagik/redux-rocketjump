import { rj } from '../../index'
import { SUCCESS } from '../../actionTypes'
import rjListInsert from '../listInsert';
import rjListUpdate from '../listUpdate';
import rjListDelete from '../listDelete';

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

  return (prevState, action) => listReducer(prevState, action)
}

// Selectors for a list
export const makeListSelectors = getData => {

  const getList = getData

  const getCount = state => {
    const data = getList(state);
    return data === null ? null : data.length
  }

  return {
    getList,
    getCount,
  }
}

// RJ List
const rjPlainList = (config = {}) => {
  const dataReducer = makeListDataReducer(config.customListReducer)
  return rj(
    rjListInsert(),
    rjListUpdate(),
    rjListDelete(),
    {
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
