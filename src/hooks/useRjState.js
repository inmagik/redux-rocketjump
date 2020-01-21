import { useCallback } from 'react'
import { isObjectRj } from 'rocketjump-core'
import { useSelector } from 'react-redux'

export default function useRjState(rjObject, mapState) {
  if (!isObjectRj(rjObject)) {
    throw new Error(
      '[redux-rocketjump] You should provide a rj object to useRjState.'
    )
  }

  const { selectors, computeState } = rjObject

  // Make the stale selector function
  const stateSelector = useCallback(
    state => {
      if (
        typeof computeState === 'function' ||
        typeof mapState === 'function'
      ) {
        let derivedState = state
        if (typeof computeState === 'function') {
          derivedState = computeState(state, selectors)
        }
        if (typeof mapState === 'function') {
          derivedState = mapState(state, selectors, derivedState)
        }
        return derivedState
      }
      // Return base state directly
      return selectors.getBaseState(state)
    },
    [mapState, computeState, selectors]
  )

  const selectedState = useSelector(stateSelector)
  return selectedState
}
