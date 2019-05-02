import { rj } from '../../rocketjump'
import { takeEveryAndCancel } from '../../effects'
import rjMap from '../map'

export default (c = {}) => {
  const config = {
    // Default clear state when delete success
    keepDeleted: false,
    ...c,
  }
  return rj(
    rjMap({
      keepSucceded: config.keepDeleted,
      // Simply mark as "deleted" in data
      dataReducer: () => true,
    }),
    {
      proxySelectors: ({
        getMapLoadings,
        getMapFailures,
        getMapData,
      }) => ({
        // Simply "export" a more consistent names...
        getDeleting: getMapLoadings,
        getDeleted: getMapData,
        getFailures: getMapFailures,
      }),
      proxyActions: {
        performDelete: ({ load }) => (id, params = {}, meta = {}) =>
          load({ id, ...params }, { id, ...meta }),
      },
      takeEffect: takeEveryAndCancel,
      takeEffectArgs: [],
    }
  )
}
