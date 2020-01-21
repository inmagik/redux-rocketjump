import { useCallback, useEffect, useMemo, useRef } from 'react'
import { isObjectRj, bindActionCreators } from 'rocketjump-core'
import { useDispatch } from 'react-redux'
import { registerCallbacks } from '../rjMiddleware'

export default function useRjActions(rjObject) {
  if (!isObjectRj(rjObject)) {
    throw new Error(
      '[redux-rocketjump] You should provide a rj object to useRjActions.'
    )
  }
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

  // Unregister pending / unresolved callbacks
  useEffect(
    () => () =>
      Object.keys(callbacksIds.current).forEach(id =>
        callbacksIds.current[id]()
      ),
    []
  )

  const { buildableActions: actions } = rjObject

  const boundActions = useMemo(
    () => bindActionCreators(actions, dispatchWithCallbacks),
    [dispatchWithCallbacks, actions]
  )
  return boundActions
}
