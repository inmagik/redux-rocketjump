import { RUN, UNLOAD, EFFECT_ACTION } from './actionTypes'

// Mark an action as an effect action
// When an action is marked as an "effect action"
// in addition of beeing dispatched in the local rj store
// is passed to the rj observable to interact to sief effect:
// run the side effect, cance it etc...
const makeEffectAction = action => {
  Object.defineProperty(action, EFFECT_ACTION, { value: true })
  return action
}

// Barebone action creators

// TODO: Bro i'm not totaly pround of this name
// but i can't fine a better name ....
// pass object
export function runAdvanced(params = [], meta = {}, onSuccess, onFailure) {
  return makeEffectAction({
    type: RUN,
    payload: {
      params,
    },
    meta,
    callbacks: {
      onSuccess,
      onFailure,
    },
  })
}

export function run(...params) {
  return runAdvanced(params)
}

export function unload(meta = {}) {
  return makeEffectAction({ type: UNLOAD, meta })
}
