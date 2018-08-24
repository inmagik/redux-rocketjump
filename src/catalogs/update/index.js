import { rj } from '../../rocketjump'
import { takeEveryAndCancel } from '../../effects'
import rjMap from '../map'

export default rj(
  rjMap({
    // Useless info...
    dataReducer: () => null,
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
      load: ({ load }) => (obj, meta = {}) =>
        load(obj, { id: obj.id, ...meta }),
    },
    takeEffect: takeEveryAndCancel,
  }
)
