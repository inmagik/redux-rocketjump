// // Base action types from type
export const makeActionTypes = type => ({
  main: type,
  loading: `${type}_LOADING`,
  success: `${type}_SUCCESS`,
  failure: `${type}_FAILURE`,
  unload: `${type}_UNLOAD`,
})

// TODO: Move all of this shit in rocketjump-core

// Mark action for run into rx
const EFFECT_ACTION = '@@RJ/EFFECT'

/**
 * Mark an action as an effect action
 * When an action is marked as an "effect action"
 *  in addition of being dispatched in the local rj store
 *  it is passed to the rj observable to interact with the side effect:
 *  run the side effect, cancel it etc...
 */
const makeEffectAction = action => {
  Object.defineProperty(action, EFFECT_ACTION, { value: true })
  return action
}

/**
 * Check if is an effect action
 */
export const isEffectAction = action => {
  return action[EFFECT_ACTION] === true
}

/**
 * Powerful helper to work with metadata
 * Its arg can either be a plain object, in which case it is merged in , or a function, in which
 *  case meta is hard set to the return value of the function
 */
function withMeta(meta) {
  const out = makeEffectAction({
    ...this,
    meta:
      typeof meta === 'function'
        ? meta(this.meta)
        : {
            ...this.meta,
            ...meta,
          },
  })
  out.extend = extend.bind(out)
  out.withMeta = withMeta.bind(out)
  return out
}

/**
 * This function allows to inject some extra params in a library action
 * It is a delicate operation, since it works by constructing a new action object
 * and rebinding the operations (extends and withMeta) to it
 */
function extend(extensions) {
  const out = makeEffectAction({
    ...this,
    meta: {
      ...this.meta,
      ...extensions.meta,
    },
    callbacks: {
      onSuccess: extensions.callbacks && extensions.callbacks.onSuccess,
      onFailure: extensions.callbacks && extensions.callbacks.onFailure,
    },
  })
  out.extend = extend.bind(out)
  out.withMeta = withMeta.bind(out)
  return out
}

/**
 * Creates a new library action
 * A library action is a predefined action that can be handled in the context of rocketjump side effect model
 * Such actions are wired into the library and are extremely general: customization with the `actions` directive
 * is provided in order to adapt them (and their interface and behaviour) to user needs
 */
export function makeLibraryAction(type, ...params) {
  const baseObject = makeEffectAction({
    type,
    payload: {
      params,
    },
    meta: {},
    callbacks: {
      onSuccess: undefined,
      onFailure: undefined,
    },
  })
  baseObject.extend = extend.bind(baseObject)
  baseObject.withMeta = withMeta.bind(baseObject)
  return baseObject
}

// Compatible with official Albi 1312 Builder
export function makeBuildableActions(type) {
  return {
    run: (...params) => makeLibraryAction(type, ...params),
    clean: (...params) => makeLibraryAction(`${type}_UNLOAD`, ...params),
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
  }
}
