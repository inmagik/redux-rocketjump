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

function withMeta(meta) {
  return this.extend({
    meta
  })
}

function extend(extensions) {
  const out = makeEffectAction({
    ...this,
    meta: {
      ...this.meta,
      ...extensions.meta
    },
    callbacks: {
      onSuccess: extensions.callbacks && extensions.callbacks.onSuccess,
      onFailure: extensions.callbacks && extensions.callbacks.onFailure
    },
  })
  out.extend = extend.bind(out)
  out.withMeta = withMeta.bind(out)
  return out
}

export function run(...params) {
  const baseObject = makeEffectAction({
    type: RUN,
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

export function unload(...params) {
  const baseObject = makeEffectAction({
    type: UNLOAD,
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

// TODO: Bro i'm not totaly pround of this name
// but i can't fine a better name ....
// export function run({ params = [], meta = {}, onSuccess, onFailure } = {}) {
//   return makeEffectAction({
//     type: RUN,
//     payload: {
//       params,
//     },
//     meta,
//     callbacks: {
//       onSuccess,
//       onFailure,
//     },
//   })
// }
// run.__builder__ = {
//   props: ['meta'],
//   call: (fn, args, meta, { onSuccess, onFailure }) => fn({ params: args, meta, onSuccess, onFailure })
// }

// TODO: Better clear or teardown
// export function unload(meta = {}, onSuccess = undefined, onFailure = undefined) {
//   return makeEffectAction({ type: UNLOAD, meta, callbacks: { onSuccess, onFailure } })
// }
// unload.__builder__ = {
//   props: ['meta'],
//   call: (fn, args, meta, { onSuccess, onFailure }) => fn(meta, onSuccess, onFailure)
// }

