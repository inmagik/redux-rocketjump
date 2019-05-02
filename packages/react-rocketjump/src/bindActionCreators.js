import { EFFECT_ACTION } from './actionTypes'

// This is a copy-paste of old school bindActionCreators of redux
// in addition when an action is marked as an "effect" action
// is emitted to subject

function bindActionCreator(actionCreator, dispatch, subject) {
  return (...args) => {
    const action = actionCreator(...args)
    if (action[EFFECT_ACTION] === true) {
      subject.next(action)
    }
    dispatch(action)
  }
}

export default function bindActionCreators(actionCreators, dispatch, subject) {
  const boundActionCreators = {}
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key]
    boundActionCreators[key] = bindActionCreator(
      actionCreator,
      dispatch,
      subject
    )
  }
  return boundActionCreators
}
