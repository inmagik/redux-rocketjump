import { fork, call, put, all } from 'redux-saga/effects'
import { makeActionTypes } from './actions'
import {
  takeLatestAndCancel,
  takeEveryAndCancel,
  takeExhaustAndCancel,
  takeLatestAndCancelGroupBy,
  takeExhaustAndCancelGroupBy,
} from './effects'

// React Rj Style Yeah!
const RjFactoryEffects = {
  latest: takeLatestAndCancel,
  every: takeEveryAndCancel,
  exhaust: takeExhaustAndCancel,
  groupBy: takeLatestAndCancelGroupBy,
  groupByExhaust: takeExhaustAndCancelGroupBy,
}

const id = a => a

export default (
  actionTypeOrTypes,
  apiFn,
  extraParamsEffects = [],
  takeEffectGeneratorOrLiteral = takeLatestAndCancel,
  callApi = call,
  needEffect,
  successEffects = [],
  failureEffects = [],
  takeEffectArgs = [],
  mapLoadingAction = id,
  mapSuccessAction = id,
  mapFailureAction = id,
  unloadTypes = []
) => {
  let takeEffect
  if (typeof takeEffectGeneratorOrLiteral === 'string') {
    if (RjFactoryEffects[takeEffectGeneratorOrLiteral] === undefined) {
      // Bad take effect name
      throw new Error(
        `[redux-rocketjump] bad takeEffect name '${takeEffectGeneratorOrLiteral}'` +
          ` please use one of them: ${Object.keys(RjFactoryEffects).join(
            ', '
          )} or provide a custom generator.`
      )
    }
    takeEffect = RjFactoryEffects[takeEffectGeneratorOrLiteral]
  } else {
    // Use as a custom generator
    takeEffect = takeEffectGeneratorOrLiteral
  }

  let actionTypes
  if (typeof actionTypeOrTypes === 'string') {
    // When string is given build action types as usual
    actionTypes = makeActionTypes(actionTypeOrTypes)
  } else {
    // Othrwise assumes that is alredy maked action types map
    actionTypes = actionTypeOrTypes
  }

  function* handleApi({ payload: { params }, meta }) {
    // Should perform the call?
    if (typeof needEffect === 'function') {
      const needToRun = yield needEffect(meta)
      if (!needToRun) {
        return
      }
    }
    yield put(mapLoadingAction({ type: actionTypes.loading, meta: meta }))
    try {
      // Get extra shit from outside HOOK
      let finalParams = params
      for (let i = 0; i < extraParamsEffects.length; i++) {
        const extraParams = yield extraParamsEffects[i](finalParams, meta)
        finalParams = Array.isArray(finalParams)
          ? (finalParams = extraParams)
          : (finalParams = { ...finalParams, ...extraParams })
      }

      // Run api using given call api function \w all the merged params
      let data
      if (Array.isArray(finalParams)) {
        data = yield callApi(apiFn, ...finalParams)
      } else {
        data = yield callApi(apiFn, finalParams)
      }

      yield put(
        mapSuccessAction({
          type: actionTypes.success,
          meta,
          payload: {
            data,
            // Sha la la la
            params: finalParams,
          },
        })
      )
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
      yield put(
        mapFailureAction({
          type: actionTypes.failure,
          payload: error,
          error: true,
          meta,
        })
      )
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
