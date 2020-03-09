import { useCallback, useMemo } from 'react'
import { isObjectRj } from 'rocketjump-core'
import { useSelector } from 'react-redux'
import { shallowEqualObjects } from '../helpers'

export default function useRjState(rjObject, mapState) {
  if (!isObjectRj(rjObject)) {
    throw new Error(
      '[redux-rocketjump] You should provide a rj object to useRjState.'
    )
  }

  const { selectors, computeState } = rjObject

  const memoComputeState = useMemo(() => {
    if (typeof computeState !== 'function') {
      return null
    }
    let lastComputedState = null
    return state => {
      const computedState = computeState(state, selectors)
      if (
        lastComputedState &&
        shallowEqualObjects(lastComputedState, computedState)
      ) {
        return lastComputedState
      }
      lastComputedState = computedState
      return computedState
    }
  }, [selectors, computeState])

  // Make the stale selector function
  const stateSelector = useCallback(
    state => {
      if (
        typeof memoComputeState === 'function' ||
        typeof mapState === 'function'
      ) {
        let derivedState = state
        if (typeof memoComputeState === 'function') {
          derivedState = memoComputeState(state)
        }
        if (typeof mapState === 'function') {
          derivedState = mapState(state, selectors, derivedState)
        }
        return derivedState
      }
      // Return base state directly
      return selectors.getBaseState(state)
    },
    [mapState, memoComputeState, selectors]
  )

  const selectedState = useSelector(stateSelector)
  return selectedState
}
