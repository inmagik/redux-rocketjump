import { fork, call, put, all } from 'redux-saga/effects'
import { makeActionTypes } from './actions'
import { takeLatestAndCancel } from '../effects'

export default (
  actionType,
  apiFn,
  extraParamsEffects = [],
  takeEffect = takeLatestAndCancel,
  callApi = call,
  successEffects = [],
  failureEffects = [],
  takeEffectArgs = [],
) => {
  const actionTypes = makeActionTypes(actionType)
  function* handleApi({ payload: { params }, meta }) {
    yield put({ type: actionTypes.loading, meta })
    try {
      // Get extra shit from outside HOOK
      let finalParams = { ...params }
      for (let i = 0; i < extraParamsEffects.length; i++) {
        const extraParams = yield extraParamsEffects[i](finalParams, meta)
        finalParams = { ...finalParams, ...extraParams }
      }

      // Run api with using given call api function
      const data = yield callApi(apiFn, finalParams)

      yield put({ type: actionTypes.success, meta, payload: {
        data,
        // Sha la la la
        params: finalParams,
      }})
      yield all(successEffects.map(effect => effect(data, meta)))
    } catch (error) {
      yield put({ type: actionTypes.failure, meta, error })
      yield all(failureEffects.map(effect => effect(error, meta)))
    }
  }

  return function* watchApi() {
    yield fork(
      takeEffect,
      actionTypes.main,
      actionTypes.unload,
      handleApi,
      ...takeEffectArgs,
    )
  }
}
