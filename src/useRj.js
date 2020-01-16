import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerCallbacks } from './rjMiddleware'
import bindActionCreators from './bindActionCreators'

export default function useRj(rjObject, mapState) {
  const dispatch = useDispatch()

  const callbacksIds = useRef({})

  const dispatchWithCallbacks = useCallback(
    action => {
      if (action.callbacks) {
        const [rjCallId, unregisterCallbacks] = registerCallbacks(
          action.callbacks
        )
        action.meta.rjCallId = rjCallId
        // Save reference to unregister fn
        callbacksIds.current[rjCallId] = unregisterCallbacks
        // Clean up local shit
        action.callbacks.onComplete = () => {
          delete callbacksIds.current[rjCallId]
        }
        delete action.callbacks
        dispatch(action)
      } else {
        dispatch(action)
      }
    },
    [dispatch]
  )
  console.log(callbacksIds.current)

  // Unregister pending / unresolved callbacks
  useEffect(
    () => () =>
      Object.keys(callbacksIds.current).forEach(id => callbacksIds[id]()),
    []
  )

  const { actions, selectors } = rjObject

  const boundActions = useMemo(
    () => bindActionCreators(actions, dispatchWithCallbacks),
    [dispatchWithCallbacks, actions]
  )

  const stateSelector =
    typeof mapState === 'function'
      ? state => mapState(state, selectors)
      : state => selectors.getBaseState(state)

  const selectedState = useSelector(stateSelector)

  return useMemo(() => [selectedState, boundActions], [
    selectedState,
    boundActions,
  ])
}
