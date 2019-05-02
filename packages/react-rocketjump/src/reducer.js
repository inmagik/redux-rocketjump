import { LOADING, FAILURE, SUCCESS, UNLOAD } from './actionTypes'

// Barebone reducer for handle an async effect

const defaultState = {
  loading: false,
  error: null,
  data: null,
}

export default function reducer(prevState = defaultState, action) {
  const { type } = action
  switch (type) {
    case LOADING:
      return {
        ...prevState,
        error: null,
        loading: true,
      }
    case FAILURE:
      return {
        ...prevState,
        loading: false,
        error: action.payload,
      }
    case SUCCESS:
      return {
        ...prevState,
        loading: false,
        data: action.payload.data,
      }
    case UNLOAD:
      // So easy if someone add some shit to state
      // simply preserve that keys!
      return { ...prevState, ...defaultState }
    default:
      return prevState
  }
}
