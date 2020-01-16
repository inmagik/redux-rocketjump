import request from 'superagent'
import { omit } from 'lodash'
import { combineReducers } from 'redux'
import {
  rj,
  makeActionTypes,
  composeReducers,
  takeEveryAndCancel,
} from 'redux-rocketjump'
// import rjPosArgs from 'redux-rocketjump/plugins/positionalArgs'
import { fork } from 'redux-saga/effects'

const API_URL = `http://${window.location.hostname}:9001`

const ADD_TODO = 'ADD_TODO'
export const {
  actions: { load: addTodo },
  selectors: { isLoading: isAddingTodo, getError: getAddTodoError },
  reducer: addTodoReducer,
  saga: addTodoSaga,
} = rj({
  type: ADD_TODO,
  takeEffect: takeEveryAndCancel,
  // No need to save added todo
  dataReducer: () => null,
  state: 'todos.add',
  effect: todo =>
    request
      .post(`${API_URL}/todos`)
      .send(todo)
      .then(({ body }) => body),
})()

const multiloadingRj = rj({
  takeEffect: takeEveryAndCancel,
  reducer: (odlReducer, { type: confType }) => (
    prevState = {},
    { type, meta }
  ) => {
    const types = makeActionTypes(confType)
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
})

const UPDATE_TODO = 'UPDATE_TODO'
export const {
  actions: { load: updateTodo },
  selectors: { getBaseState: getUpdatingTodos },
  reducer: updateTodoReducer,
  saga: updateTodoSaga,
} = rj(multiloadingRj, {
  type: UPDATE_TODO,
  state: 'todos.update',
  actions: {
    load: ({ load }) => todo => load({ todo }, { id: todo.id }),
  },
  // Keep trak only of updating todos....
  effect: ({ todo }) =>
    request
      .put(`${API_URL}/todos/${todo.id}`)
      .send(todo)
      .then(({ body }) => body),
})()

const DELETE_TODO = 'DELETE_TODO'
export const {
  actions: { load: deleteTodo },
  selectors: { getBaseState: getDeletingTodos },
  reducer: deleteTodoReducer,
  saga: deleteTodoSaga,
} = rj(multiloadingRj, {
  type: DELETE_TODO,
  state: 'todos.delete',
  actions: {
    load: ({ load }) => id => load({ id }, { id }),
  },
  // Keep trak only of updating todos....
  effect: ({ id }) => request.delete(`${API_URL}/todos/${id}`),
})()

const GET_TODOS = 'GET_TODOS'
export const TodosState = rj({
  type: GET_TODOS,
  state: 'todos.list',
  effect: (...args) => {
    console.log('O.o', args)
    return request.get(`${API_URL}/todos`).then(({ body }) => body)
  },
  reducer: reducer =>
    composeReducers(reducer, (prevState, { type, payload, meta }) => {
      switch (type) {
        case makeActionTypes(ADD_TODO).success:
          return {
            ...prevState,
            data: prevState.data.concat(payload.data),
          }
        case makeActionTypes(UPDATE_TODO).success:
          return {
            ...prevState,
            data: prevState.data.map(todo =>
              todo.id === payload.data.id ? payload.data : todo
            ),
          }
        case makeActionTypes(DELETE_TODO).success:
          return {
            ...prevState,
            data: prevState.data.filter(todo => todo.id !== meta.id),
          }
        default:
          return prevState
      }
    }),
})()

export const {
  actions: { load: loadTodos },
  selectors: { getData: getTodos, isLoading: areTodosLoading },
  reducer: todoListReducer,
  saga: todoListSaga,
} = TodosState

export const saga = function*() {
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
