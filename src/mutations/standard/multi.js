import omit from 'lodash.omit'

function makeMultiMutationReducer(makeKey) {
  return (state = { pendings: {}, errors: {} }, action) => {
    switch (action.type) {
      case 'LOADING': {
        const key = makeKey(...action.meta.params)
        return {
          errors: omit(state.errors, key),
          pendings: {
            ...state.pendings,
            [key]: true,
          },
        }
      }
      case 'FAILURE': {
        const key = makeKey(...action.meta.params)
        return {
          errors: {
            ...state.errors,
            [key]: action.payload,
          },
          pendings: omit(state.pendings, key),
        }
      }
      case 'UNLOAD':
      case 'SUCCESS': {
        const key = makeKey(...action.meta.params)
        return {
          ...state,
          pendings: omit(state.pendings, key),
        }
      }
      default:
        return state
    }
  }
}

export default function multi(makeKey, mutationConfig) {
  return {
    reducer: makeMultiMutationReducer(makeKey),
    takeEffect: 'groupByExhaust',
    takeEffectArgs: [action => makeKey(...action.meta.params)],
    ...mutationConfig,
  }
}
