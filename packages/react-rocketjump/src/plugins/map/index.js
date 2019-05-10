import { omit } from '../../helpers'
import { rj } from '../../index'
import { PENDING, SUCCESS, FAILURE, CLEAN } from '../../actionTypes';

const defaultKeyMaker = action => (action.meta ? action.meta.id : null)
const defaultDataTransform = arg => arg

const defaultState = {
  pending: false,
  error: null,
  data: null,
}

const makeItemReducer = dataTransform => (prevState, action) => {
  const { type } = action
  switch (type) {
    case PENDING:
      return {
        ...prevState,
        error: null,
        pending: true,
      }
    case FAILURE:
      return {
        ...prevState,
        pending: false,
        error: action.payload,
      }
    case SUCCESS:
      return {
        ...prevState,
        pending: false,
        data: dataTransform(action.payload.data),
      }
    case CLEAN:
      // So easy if someone add some shit to state
      // simply preserve that keys!
      return { ...prevState, ...defaultState }
    default:
      return prevState
  }
}

const makeMapReducer = (
  keyMaker = defaultKeyMaker,
  dataTransform,
  keepCompleted = true,
  fallbackReducer = null,
) => {
  const itemReducer = makeItemReducer(dataTransform || defaultDataTransform)

  return (prevState = {}, action) => {
    switch (action.type) {
      case PENDING:
      case FAILURE: {
        const key = keyMaker(action)
        return {
          ...prevState,
          [key]: itemReducer(prevState[key], action),
        }
      }
      case SUCCESS: {
        const key = keyMaker(action)
        if (keepCompleted) {
          return {
            ...prevState,
            [key]: itemReducer(prevState[key], action),
          }
        } else {
          return omit(prevState, key)
        }
      }
      case CLEAN: {
        const key = keyMaker(action)
        // Clear key state
        if (key) {
          return omit(prevState, key)
        }
        // Clear all the state
        return {}
      }
      default:
        if (fallbackReducer) return fallbackReducer(prevState, action)
        else return prevState
    }
  }
}

const makeMapSelectors = () => {
  const getMapPendings =
    state => {
      Object.keys(state).reduce(
        (r, key) => (state[key].pending ? { ...r, [key]: true } : r),
        {}
      )
    }

  const getMapLoadings = getMapPendings

  const getMapFailures =
    state =>
      Object.keys(state).reduce((r, key) => {
        const error = state[key].error
        return error !== null ? { ...r, [key]: error } : r
      }, {})

  const getMapData =
    state =>
      Object.keys(state).reduce((r, key) => {
        const data = state[key].data
        return data !== null ? { ...r, [key]: data } : r
      }, {})

  return {
    getMapLoadings,
    getMapPendings,
    getMapFailures,
    getMapData,
  }
}

const rjMap = (mapConfig = {}) =>
  rj({
    actions: ({ run, clean }) => ({
      runKey: (id, ...params) => run(id, ...params).withMeta({ id }),
      cleanKey: id => clean({ id }).withMeta({ id }),
    }),
    reducer: oldReducer =>
      makeMapReducer(
        mapConfig.key,
        mapConfig.dataTransform,
        mapConfig.keepCompleted,
        oldReducer
      ),
    selectors: () => makeMapSelectors(),
    takeEffect: ["groupBy", typeof mapConfig.key === 'function' ? mapConfig.key : defaultKeyMaker],
  })

export default rjMap