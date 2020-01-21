import { useDebugValue, useMemo } from 'react'
import { isObjectRj } from 'rocketjump-core'
import useRjActions from './useRjActions'
import useRjState from './useRjState'

export default function useRj(rjObject, mapState) {
  if (!isObjectRj(rjObject)) {
    throw new Error(
      '[redux-rocketjump] You should provide a rj object to useRj.'
    )
  }
  useDebugValue(`Reduxj rj(${rjObject.__rjconfig.type}) Still Rocks`)

  const selectedState = useRjState(rjObject, mapState)
  const boundActions = useRjActions(rjObject)

  return useMemo(() => [selectedState, boundActions], [
    selectedState,
    boundActions,
  ])
}
