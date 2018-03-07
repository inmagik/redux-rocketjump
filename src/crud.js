// ***********************************
// EXPERIMENTAL SHIT
// FIXME: DONT USE THIS STILL IN DEV....
// ***********************************
import { fork } from 'redux-saga/effects'
import { combineReducers } from 'redux'
import {
  rocketjump,
  makeActions,
  makeReducer,
  makeActionTypes,
  makeApiSaga,
} from './core'
import { makeListDataReducer, makeDeleteListReducerById } from './list'
import { makeDeleteReducer } from './delete'
import { composeReducers } from './utils'

export const makeIdActions = (type) => {
  const { load, unload } = makeActions(type)

  const loadWithId = (id, params = {}, meta = {}) =>
    load({ ...params, id  }, { ...meta, id })

  return {
    load: loadWithId,
    unload,
  }
}

export const rocketjumpCrud = (config) => {
  const listType = `${config.type}/LIST`
  const detailType = `${config.type}/DETAIL`
  const deleteType = `${config.type}/DELETE`

  return rocketjump({
    proxyActions: () => {
      const listActios = makeActions(listType)
      const detailActions = makeIdActions(detailType)
      const deleteActions = makeIdActions(detailType)

      return {
        // List
        loadList: listActios.load,
        unloadList: listActios.unload,
        // Detail
        loadDetail: detailActions.load,
        unloadDetail: detailActions.unload,
        // Delete
        loadDelete: deleteActions.load,
        unloadDelete: deleteActions.unload,
      }
    },
    proxyReducer: () => {
      return combineReducers({
        list: composeReducers(
          makeReducer(listType, makeListDataReducer(config)),
          makeDeleteListReducerById(makeActionTypes(deleteType).success),
        ),
        detail: makeReducer(detailType),
        delete: makeDeleteReducer(deleteType),
      })
    },
    proxySelectors: () => {
      // let selectors = {}
      // selectors = { ...makeDeleteSelectors(`${config.state}.delete`) }
      // selectors = {}
    },
    saga: () => function *() {
      yield fork(makeApiSaga(
        listType,
        config.apiList,
        config.apiListExtraParams || config.apiExtraParams,
        undefined,
        config.callApi,
        config.listSuccessEffect,
        config.listFailureEffect
      ))
      yield fork(makeApiSaga(
        detailType,
        config.apiDetail,
        // TODO: IT suck bro do better...
        config.apiDetailExtraParams || config.apiExtraParams,
        undefined,
        config.callApi,
        config.detailSuccessEffect,
        config.detailFailureEffect
      ))
      yield fork(makeApiSaga(
        deleteType,
        config.apiDelete,
        // TODO: IT suck bro do better...
        config.apiDeleteExtraParams || config.apiExtraParams,
        undefined,
        config.callApi,
        config.deleteSuccessEffect,
        config.deleteFailureEffect
      ))
    },
  })(config)
}
