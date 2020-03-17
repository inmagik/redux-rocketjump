function singleMutationReducer(
  state = { pending: false, error: null },
  action
) {
  switch (action.type) {
    case 'LOADING':
      return {
        ...state,
        error: null,
        pending: true,
      }
    case 'FAILURE':
      return {
        ...state,
        error: action.payload,
        pending: false,
      }
    case 'SUCCESS':
    case 'UNLOAD':
      return {
        ...state,
        pending: false,
      }
    default:
      return state
  }
}

export default function singleMutation(mutationConfig) {
  return {
    reducer: singleMutationReducer,
    takeEffect: 'exhaust',
    ...mutationConfig,
  }
}
