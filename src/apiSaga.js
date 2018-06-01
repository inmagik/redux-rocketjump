import { fork, call, put, all } from 'redux-saga/effects'
import { makeActionTypes } from './actions'
import { takeLatestAndCancel } from './effects'

const id = a => a

export default (
  actionType,
  apiFn,
  extraParamsEffects = [],
  takeEffect = takeLatestAndCancel,
  callApi = call,
  successEffects = [],
  failureEffects = [],
  takeEffectArgs = [],
  mapLoadingAction = id,
  mapSuccessAction = id,
  mapFailureAction = id,
  unloadTypes = [],
) => {
  const actionTypes = makeActionTypes(actionType)
  function* handleApi({ payload: { params }, meta }) {
    yield put(mapLoadingAction({ type: actionTypes.loading, meta: meta }))
    try {
      // Get extra shit from outside HOOK
      let finalParams = params
      for (let i = 0; i < extraParamsEffects.length; i++) {
        const extraParams = yield extraParamsEffects[i](finalParams, meta)
        finalParams = Array.isArray(finalParams)
          ? finalParams = extraParams
          : finalParams = { ...finalParams, ...extraParams }
      }

      // Run api using given call api function \w all the merged params
      let data
      if (Array.isArray(finalParams)) {
        data = yield callApi(apiFn, ...finalParams)
      } else {
        data = yield callApi(apiFn, finalParams)
      }

      yield put(mapSuccessAction({
        type: actionTypes.success,
        meta,
        payload: {
          data,
          // Sha la la la
          params: finalParams,
        },
      }))
      yield all(successEffects.map(effect => effect(data, meta)))
    } catch (error) {
      // Avoid headache
      if (
        error instanceof TypeError ||
        error instanceof RangeError ||
        error instanceof SyntaxError ||
        error instanceof ReferenceError
      ) {
        throw error
      }
      yield put(mapFailureAction({
        type: actionTypes.failure,
        payload: error,
        error: true,
        meta,
      }))
      yield all(failureEffects.map(effect => effect(error, meta)))
    }
  }

  return function* watchApi() {
    yield fork(
      takeEffect,
      actionTypes.main,
      [actionTypes.unload, ...unloadTypes],
      handleApi,
      ...takeEffectArgs
    )
  }
}
