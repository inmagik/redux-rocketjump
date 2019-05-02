import { rj } from '../../rocketjump'
import { takeEveryAndCancel } from '../../effects'
import rjMap from '../map'

export default (c = {}) => {
  const config = {
    // Default clear state when update success
    keepUpdated: false,
    ...c,
  }
  return rj(
    rjMap({
      keepSucceded: config.keepUpdated,
    }),
    {
      proxySelectors: ({ getMapLoadings, getMapFailures }) => ({
        // Simply "export" a more consistent names...
        getUpdating: getMapLoadings,
        getFailures: getMapFailures,
      }),
      proxyActions: {
        update: ({ load }) => (obj, meta = {}) =>
          load(obj, { id: obj.id, ...meta }),
      },
      takeEffect: takeEveryAndCancel,
      takeEffectArgs: [],
    }
  )
}
