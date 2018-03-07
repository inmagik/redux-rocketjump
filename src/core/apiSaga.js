import { fork, call, put } from 'redux-saga/effects'
import { makeActionTypes } from './actions'
import { takeLatestAndCancel } from '../effects'

export default (
  actionType,
  apiFn,
  extraParamsEffect,
  takeEffect = takeLatestAndCancel,
  callApi = call,
  successEffect,
  failureEffect
) => {
  const actionTypes = makeActionTypes(actionType)
  function* handleApi({ payload: { params }, meta }) {
    yield put({ type: actionTypes.loading, meta })
    try {
      // Get extra shit from outside HOOK
      let extraParams
      if (extraParamsEffect) {
        extraParams = yield extraParamsEffect(params, meta)
      }

      const finalParams = {
        ...params,
        ...extraParams,
      }
      const data = yield callApi(apiFn, finalParams)

      yield put({ type: actionTypes.success, meta, payload: {
        data,
        // Sha la la la
        params: finalParams,
      }})
      if (successEffect) {
        yield successEffect(data, meta)
      }
    } catch (error) {
      yield put({ type: actionTypes.failure, meta, error })
      if (failureEffect) {
        yield failureEffect(error, meta)
      }
    }
  }

  return function* watchApi() {
    yield fork(
      takeEffect,
      actionTypes.main,
      actionTypes.unload,
      handleApi
    )
  }
}
