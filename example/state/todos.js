import request from 'superagent'
import { omit } from 'lodash'
import { combineReducers } from 'redux'
import {
  rj,
  makeActionTypes,
  composeReducers,
  takeEveryAndCancel,
} from 'redux-rocketjump'
import { rj as reactRj } from 'react-rocketjump'
import { fork, put } from 'redux-saga/effects'

const callMaMen = (apiFn, ...params) => {
  return apiFn(...params, 'GIOVA THE KING @@@23')
}

const todosState0 = reactRj({
  actions: ({ run }) => ({
    run: id => run(id).withMeta({ id, z: 1 })
  })
})

const todosState1 = reactRj(todosState0, {
  actions: ({ run }) => ({
    run: id => run(id * 2)
  })
})

export const todosState = reactRj(todosState1, {
  callEffect: callMaMen,
  effect: (gang = '', ns = '') => Promise.resolve([{
    id: 23,
    title: `Kill Humans ~${gang} - ${ns}`,
  }]),
  actions: ({ run }) => ({
    run: id => run(id).withMeta(meta => ({ ...meta, w: 3, k: meta.z }))
  }),
  // () => request.get(`${API_URL}/todos`).then(({ body }) => body),
})()


const API_URL = `http://${window.location.hostname}:3000`

const ADD_TODO = 'ADD_TODO'
export const {
  actions: {
    load: addTodo,
  },
  selectors: {
    isLoading: isAddingTodo,
    getError: getAddTodoError,
  },
  reducer: addTodoReducer,
  saga: addTodoSaga,
} = rj({
  type: ADD_TODO,
  takeEffect: takeEveryAndCancel,
  // No need to save added todo
  dataReducer: () => null,
  state: 'todos.add',
  api: todo => request.post(`${API_URL}/todos`)
    .send(todo)
    .then(({ body }) => body)
})()

const multiloadingRj = (config, ...args) => rj({
  takeEffect: takeEveryAndCancel,
  proxyReducer: () => (prevState = {}, { type, meta }) => {
    const types = makeActionTypes(config.type)
    switch (type) {
      case types.loading:
        return {
          ...prevState,
          [meta.id]: true,
        }
      case types.success:
      case types.failure:
        return omit(prevState, meta.id)
      default:
        return prevState
    }
  },
})(config, ...args)

const UPDATE_TODO = 'UPDATE_TODO'
export const {
  actions: {
    load: updateTodo,
  },
  selectors: {
    getBaseState: getUpdatingTodos,
  },
  reducer: updateTodoReducer,
  saga: updateTodoSaga,
} = multiloadingRj({
  type: UPDATE_TODO,
  state: 'todos.update',
  proxyActions: {
    load: ({ load }) => todo => load({ todo }, { id: todo.id }),
  },
  // Keep trak only of updating todos....
  api: ({ todo }) => request.put(`${API_URL}/todos/${todo.id}`)
    .send(todo)
    .then(({ body }) => body)
})

const DELETE_TODO = 'DELETE_TODO'
export const {
  actions: {
    load: deleteTodo,
  },
  selectors: {
    getBaseState: getDeletingTodos,
  },
  reducer: deleteTodoReducer,
  saga: deleteTodoSaga,
} = multiloadingRj({
  type: DELETE_TODO,
  state: 'todos.delete',
  proxyActions: {
    load: ({ load }) => id => load({ id }, { id }),
  },
  // Keep trak only of updating todos....
  api: ({ id }) => request.delete(`${API_URL}/todos/${id}`)
})

const GET_TODOS = 'GET_TODOS'
export const {
  actions: {
    load: loadTodos,
  },
  selectors: {
    getData: getTodos,
    isLoading: areTodosLoading,
  },
  reducer: todoListReducer,
  saga: todoListSaga,
} = rj({
  type: GET_TODOS,
  state: 'todos.list',
  api: () => request.get(`${API_URL}/todos`).then(({ body }) => body),
  proxyReducer: reducer => composeReducers(reducer, (prevState, { type, payload, meta }) => {
    switch (type) {
      case makeActionTypes(ADD_TODO).success:
        return {
          ...prevState,
          data: prevState.data.concat(payload.data),
        }
      case makeActionTypes(UPDATE_TODO).success:
        return {
          ...prevState,
          data: prevState.data.map(todo => (
            todo.id === payload.data.id ? payload.data : todo
          ))
        }
      case makeActionTypes(DELETE_TODO).success:
        return {
          ...prevState,
          data: prevState.data.filter(todo => todo.id !== meta.id),
        }
      default:
        return prevState
    }
    return prevState
  })
})()

export const saga = function* () {
  yield fork(todoListSaga)
  yield fork(addTodoSaga)
  yield fork(deleteTodoSaga)
  yield fork(updateTodoSaga)
}

export const reducer = combineReducers({
  list: todoListReducer,
  add: addTodoReducer,
  update: updateTodoReducer,
  delete: deleteTodoReducer,
})
