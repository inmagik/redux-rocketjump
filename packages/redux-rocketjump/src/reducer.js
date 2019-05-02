import { makeActionTypes } from './actions'

// Barebone reducer from type
const defaultDataReducer = (prevState, { payload }) => payload.data
export const makeReducer = (type, dataReducer = defaultDataReducer) => {
  const actionTypes = makeActionTypes(type)

  const defaultState = {
    loading: false,
    error: null,
    data: null,
  }

  return (prevState = defaultState, action) => {
    const { type } = action
    switch (type) {
      case actionTypes.loading:
        return {
          ...prevState,
          error: null,
          loading: true,
        }
      case actionTypes.failure:
        return {
          ...prevState,
          loading: false,
          error: action.payload,
        }
      case actionTypes.success:
        return {
          ...prevState,
          loading: false,
          data: dataReducer(prevState.data, action),
        }
      case actionTypes.unload:
        // So easy if someone add some shit to state
        // simply preserve that keys!
        return { ...prevState, ...defaultState }
      default:
        return prevState
    }
  }
}
