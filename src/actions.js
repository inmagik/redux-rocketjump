// Base action types from type
export const makeActionTypes = type => ({
  main: type,
  loading: `${type}_LOADING`,
  success: `${type}_SUCCESS`,
  failure: `${type}_FAILURE`,
  unload: `${type}_UNLOAD`,
})

// Barebone actions from type
export const makeActions = type => {
  const actionTypes = makeActionTypes(type)

  const load = (params = {}, meta = {}) => {
    return {
      type: actionTypes.main,
      payload: {
        params,
      },
      meta,
    }
  }
  const unload = (meta = {}) => ({ type: actionTypes.unload, meta })

  return {
    load,
    unload,
    // NOTE
    // react-rocketjump alias, in next major all the apis name will
    // be the same, and comptabilty with old api dropped ...
    // but for now simpy add some alias ...
    run: load,
    clean: unload,
  }
}
