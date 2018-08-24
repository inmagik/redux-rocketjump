import { rj } from '../../rocketjump'
import { takeEveryAndCancel } from '../../effects'
import rjMap from '../map'

export default (c = {}) => {
  const config = {
    ...c,
    // Default clear state when update success
    keepUpdated: false,
  }
  return rj(
    rjMap({
      keepSucceded: config.keepUpdated,
    }),
    {
      proxySelectors: ({
        getMapLoadings,
        getMapFailures,
      }) => ({
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
