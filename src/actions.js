import { makeLibraryAction } from 'rocketjump-core'

// Base action types from type
export const makeActionTypes = type => ({
  // TODO: in Rj 4 should become ${type}@RJ/RUN
  main: type,
  loading: `${type}_LOADING`,
  success: `${type}_SUCCESS`,
  failure: `${type}_FAILURE`,
  unload: `${type}_UNLOAD`,
  updateData: `${type}_UPDATE_DATA`,
})

const makeUpdateData = type => data => ({
  type: `${type}_UPDATE_DATA`,
  payload: data,
})

// Compatible with official Albi 1312 Builder
export function makeBuildableActions(type) {
  return {
    run: (...params) => makeLibraryAction(type, ...params),
    clean: (...params) => makeLibraryAction(`${type}_UNLOAD`, ...params),
    updateData: makeUpdateData(type),
  }
}

// Barebone actions from type
export const makeActions = type => {
  const actionTypes = makeActionTypes(type)

  // Legacy signature
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

  // Run and clean use the same syntax of buiner actions
  const run = (params = [], meta = {}) => {
    return {
      type: actionTypes.main,
      payload: {
        params,
      },
      meta,
    }
  }

  const clean = (params = [], meta = {}) => ({
    type: actionTypes.unload,
    payload: {
      params,
    },
    meta,
  })

  return {
    load,
    unload,
    // NOTE
    // react-rocketjump alias, in next major all the apis name will
    // be the same, and comptabilty with old api dropped ...
    // but for now simpy add some alias ...
    run,
    clean,
    updateData: makeUpdateData(type),
  }
}
