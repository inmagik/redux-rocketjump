import omit from 'lodash.omit'
import { rj } from '../../rocketjump'
import { makeActionTypes } from '../../actions'

const defaultPerfomedReducer = () => true
const makeReducer = (
  type,
  makeKey,
  trackPerforming = true,
  trackPerfomed = true,
  trackFailures = true,
  performedReducer = defaultPerfomedReducer,
) => {
  let defaultState = {}

  if (trackPerforming) {
    defaultState = { ...defaultState, performing: {} }
  }

  if (trackPerfomed) {
    defaultState = { ...defaultState, performed: {} }
  }

  if (trackFailures) {
    defaultState = { ...defaultState, failures: {} }
  }

  const actionTypes = makeActionTypes(type)

  return (prevState = defaultState, action) => {
    const { type, payload } = action

    if (trackPerforming && type === actionTypes.loading) {
      let nextState = {
        ...prevState,
        performing: {
          ...prevState.performing,
          [makeKey(action)]: true,
        }
      }
      if (trackFailures) {
        return {
          ...nextState,
          failures: omit(nextState.failures, makeKey(action)),
        }
      }
      return nextState
    } else if (trackFailures && type === actionTypes.failure) {
      let nextState = {
        ...prevState,
        failures: {
          ...prevState.failures,
          [makeKey(action)]: payload,
        }
      }
      if (trackPerforming) {
        return {
          ...nextState,
          performing: omit(nextState.performing, makeKey(action)),
        }
      }
      return nextState
    } else if (trackPerfomed && type === actionTypes.success) {
      let nextState = {
        ...prevState,
        performed: {
          ...prevState.performed,
          [makeKey(action)]: performedReducer(
            prevState[makeKey(action)],
            action,
          ),
        }
      }
      if (trackPerforming) {
        return {
          ...nextState,
          performing: omit(nextState.performing, makeKey(action)),
        }
      }
      return nextState
    } else if (type === actionTypes.unload) {
      return { ...prevState, ...defaultState }
    } else {
      return prevState
    }
  }
}

rj({
  proxyReducer: makeReducer(),
})
