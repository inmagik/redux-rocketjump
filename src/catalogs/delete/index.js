import { rj } from '../../rocketjump'
import { takeEveryAndCancel } from '../../effects'
import rjMap from '../map'

export default rj(
  rjMap({
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
      load: ({ load }) => (id, params = {}, meta = {}) =>
        load({ id, ...params }, { id, ...meta }),
    },
    takeEffect: takeEveryAndCancel,
  }
)
