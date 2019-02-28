import request from 'superagent'
import { omit } from 'lodash'
import { combineReducers } from 'redux'
import {
  rj,
  makeActionTypes,
  composeReducers,
  takeEveryAndCancel,
} from 'redux-rocketjump'
import combineRjs from 'redux-rocketjump/plugins/combine'
import rjPosArgs from 'redux-rocketjump/plugins/positionalArgs'
import { fork, put } from 'redux-saga/effects'

const API_URL = `http://${window.location.hostname}:3000`

/*
{
  name: '@TODOS',
  state: 'todos',
  resource: '/api/todos',
}
*/
const crud = (config = {}) => {
  return combineRjs({
    list: rj({
      type: `${config.name}_GET_LIST`,
      unload: 'XD',
      api: () => request.get(config.resource).then(({ body }) => body),
    }),
    detail: rj(rjPosArgs(), {
      type: `${config.name}_GET_DETAIL`,
      api: id => request.get(`${config.resource}/${id}`).then(({ body }) => body),
    }),
    create: rj(rjPosArgs(), {
      combineReducer: false,
      type: `${config.name}_CREATE`,
      api: id => request.get(`${config.resource}/${id}`).then(({ body }) => body),
    }),
  })
}

export const {
  connect: {
    // eheheh fucking flux heheeheh
    list: todoListStore,
    detail: todoDetailStore,
  },
  reducer,
  saga,
} = combineRjs({
  list: rj({
    type: 'GET_TODOS',
    state: 'listCulo',
    api: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
    proxyReducer: reducer => composeReducers(reducer, (prevState, { type, payload, meta }) => {
      switch (type) {
        case makeActionTypes('ADD_TODO').success:
          return {
            ...prevState,
            data: prevState.data.concat(payload.data),
          }
        case makeActionTypes('UPDATE_TODO').success:
          return {
            ...prevState,
            data: prevState.data.map(todo => (
              todo.id === payload.data.id ? payload.data : todo
            ))
          }
        case makeActionTypes('DELETE_TODO').success:
          return {
            ...prevState,
            data: prevState.data.filter(todo => todo.id !== meta.id),
          }
        default:
          return prevState
      }
    })
  }),
  detail: rj(rjPosArgs(), {
    type: 'GET_TODO',
    api: (id) => request.get(`${API_URL}/todos/${id}`).then(({ body }) => body),
  })
}, {
  state: 'todos2',
})
